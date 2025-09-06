import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product {
 storeId = '';
  productName = '';
  productCategory = '';
  productColors: string = ''; // comma separated
  productImages: File[] = [];
  price = 0;

  cloudName = 'dgafblzcu';
  uploadPreset = 'YOUR_UPLOAD_PRESET';

  constructor(private productService: ProductService) {}

  async onProductImagesSelected(event: any) {
    this.productImages = Array.from(event.target.files);
  }

  // Upload file to Cloudinary
  async uploadToCloudinary(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.secure_url || null;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return null;
    }
  }

  async saveProduct() {
    if (!this.storeId) { alert('Select store'); return; }
    if (!this.productName) { alert('Enter product name'); return; }

    const imageUrls: string[] = [];
    for (const img of this.productImages) {
      const url = await this.uploadToCloudinary(img);
      if (url) imageUrls.push(url);
    }

    try {
      await this.productService.addProduct({
        storeId: this.storeId,
        name: this.productName,
        category: this.productCategory,
        colors: this.productColors.split(',').map(c => c.trim()),
        images: imageUrls,
        price: this.price,
        status: 'active'
      });
      alert('Product saved successfully!');
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product.');
    }
  }
}