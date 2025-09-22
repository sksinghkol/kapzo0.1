import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-addstore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addstore.html',
  styleUrls: ['./addstore.scss']
})
export class Addstore {
  store: any = {
    storeName: '',
    storeSlug: '',
    description: '',
    contact: { phone: '', email: '' },
    address: { fullAddress: '', city: '', state: '', pincode: '' },
    images: [],
    categories: [],
    dealsIn: [],
    subscription: { plan: '3_months', startDate: '', endDate: '', status: 'active', reminderDays: 10 },
    status: 'active'
  };
  categoriesString = '';
  dealsInString = '';

  imageInput = '';

  constructor(private storeService: StoreService) {}

  async save() {
    // basic validation
    if (!this.store.storeName) return alert('Store name is required');
    try {
      const now = new Date().toISOString();
      const payload = { ...this.store, createdAt: now, updatedAt: now };
      await this.storeService.addStore(payload);
      alert('Store added successfully');
      // reset form
      this.store = { ...this.store, storeName: '', storeSlug: '', description: '', contact: { phone: '', email: '' }, address: { fullAddress: '', city: '', state: '', pincode: '' }, images: [], categories: [], dealsIn: [], subscription: { plan: '3_months', startDate: '', endDate: '', status: 'active', reminderDays: 10 }, status: 'active' };
    } catch (err) {
      console.error('Add store failed', err);
      alert('Failed to add store');
    }
  }

  addImage() {
    if (this.imageInput) {
      this.store.images.push(this.imageInput);
      this.imageInput = '';
    }
  }

  removeImage(i: number) {
    this.store.images.splice(i, 1);
  }

  onCategoriesChange() {
    this.store.categories = this.categoriesString ? this.categoriesString.split(',').map((s: string) => s.trim()) : [];
  }

  onDealsInChange() {
    this.store.dealsIn = this.dealsInString ? this.dealsInString.split(',').map((s: string) => s.trim()) : [];
  }
}
