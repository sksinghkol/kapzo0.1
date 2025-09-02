import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';


interface Store {
  store_id?: number;
  shop_code: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  store_name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  local_area: string;
  pincode: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-admin-store-details',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './admin-store-details.html',
  styleUrl: './admin-store-details.scss'
})
export class AdminStoreDetails implements OnInit {
  stores: Store[] = [];
  storeForm: FormGroup;
  editMode = false;
  currentStoreId: number | null = null;

  // API URLs
  apiList = 'https://android.cloudapp.ind.in/cloth_store/stores_list/2020';
  apiAdd = 'https://android.cloudapp.ind.in/cloth_store/add_stores/2020';
  apiEdit = 'https://android.cloudapp.ind.in/cloth_store/edit_stores/2020';
  apiDelete = 'https://android.cloudapp.ind.in/cloth_store/delete_stores/2020';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.storeForm = this.fb.group({
      shop_code: ['2020', Validators.required],
      owner_name: ['', Validators.required],
      owner_email: ['', [Validators.required, Validators.email]],
      owner_phone: ['', Validators.required],
      store_name: ['', Validators.required],
      description: [''],
      address: [''],
      city: [''],
      state: [''],
      local_area: [''],
      pincode: [''],
    });
  }

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores() {
    this.http.get<Store[]>(this.apiList).subscribe({
      next: (data) => (this.stores = data),
      error: (err) => console.error('Error fetching stores', err),
    });
  }

  submitForm() {
    const storeData = this.storeForm.value;

    if (this.editMode && this.currentStoreId) {
      storeData.store_id = this.currentStoreId;
      this.http.put(`${this.apiEdit}/${this.currentStoreId}`, storeData).subscribe({
        next: () => {
          this.loadStores();
          this.resetForm();
        },
        error: (err) => console.error('Error updating store', err),
      });
    } else {
      this.http.post(this.apiAdd, storeData).subscribe({
        next: () => {
          this.loadStores();
          this.resetForm();
        },
        error: (err) => console.error('Error adding store', err),
      });
    }
  }

  editStore(store: Store) {
    this.editMode = true;
    this.currentStoreId = store.store_id || null;
    this.storeForm.patchValue(store);
  }

  deleteStore(storeId: number | undefined) {
    if (!storeId) return;
    if (!confirm('Are you sure you want to delete this store?')) return;

    this.http.delete(`${this.apiDelete}/${storeId}`).subscribe({
      next: () => this.loadStores(),
      error: (err) => console.error('Error deleting store', err),
    });
  }

  resetForm() {
    this.editMode = false;
    this.currentStoreId = null;
    this.storeForm.reset({ shop_code: '2020' });
  }
}
