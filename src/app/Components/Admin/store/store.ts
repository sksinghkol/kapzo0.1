import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
@Component({
  selector: 'app-store',
  imports: [CommonModule, FormsModule],
  templateUrl: './store.html',
  styleUrls: ['./store.scss']
})
export class Store {
 storeName = '';
  ownerName = '';
  ownerPhoto!: File;
  address = '';
  homeDelivery = false;
  deliveryLocations: string = '';
  storeImages: File[] = [];

  // Cloudinary info
  private cloudName = 'dgafblzcu';
  private uploadPreset = 'kapzo0.1';

  constructor(private storeService: StoreService) {}

  // Owner photo selected
  onOwnerPhotoSelected(event: any) {
    this.ownerPhoto = event.target.files[0];
  }

  // Multiple store images selected
  onStoreImagesSelected(event: any) {
    this.storeImages = Array.from(event.target.files);
  }

  // Upload file to Cloudinary
  private async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.secure_url; // Cloudinary image URL
  }

  // Save store
  async saveStore() {
    if (!this.ownerPhoto) {
      alert('Please select owner photo.');
      return;
    }

    try {
      // Upload owner photo
      const ownerPhotoUrl = await this.uploadToCloudinary(this.ownerPhoto);

      // Upload store images
      const imageUrls: string[] = [];
      for (const img of this.storeImages) {
        if (!img) continue;
        const url = await this.uploadToCloudinary(img);
        imageUrls.push(url);
      }

      // Prepare store data
      const storeData = {
        name: this.storeName,
        owner: { name: this.ownerName, photoUrl: ownerPhotoUrl },
        address: this.address,
        delivery: { homeDelivery: this.homeDelivery, locations: this.deliveryLocations.split(',').map(loc => loc.trim()) },
        images: imageUrls,
        status: 'active'
      };

      // Save to Firestore via StoreService
      await this.storeService.addStore(storeData);

      alert('Store created successfully!');
      this.resetForm();
    } catch (err) {
      console.error('Failed to save store:', err);
      alert('Failed to save store. Check console.');
    }
  }

  private resetForm() {
    this.storeName = '';
    this.ownerName = '';
    this.ownerPhoto = undefined!;
    this.address = '';
    this.homeDelivery = false;
    this.deliveryLocations = '';
    this.storeImages = [];
  }
}