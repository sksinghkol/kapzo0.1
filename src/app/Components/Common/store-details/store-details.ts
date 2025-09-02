import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Store {
  store_id: number;
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
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

interface DeliveryLocation {
  location_id: number;
  store_id?: number;
  location_name: string;
  description: string;
  is_store_pickup: number;
  created_at: string;
}

@Component({
  selector: 'app-store-details',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './store-details.html',
  styleUrl: './store-details.scss'
})
export class StoreDetails implements OnInit {
  stores: Store[] = [];
  deliveryLocations: DeliveryLocation[] = [];
  
  currentImageIndex: { [key: number]: number } = {};
  cartQuantities: { [key: number]: number } = {};
  
  expandedStoreId: number | null = null;
  expandedLocation: number | null = null;
  
  loading: boolean = true;
  error: string | null = null;
  
  private storeApi = 'https://android.cloudapp.ind.in/cloth_store/stores_list/2020';
  private deliveryApi = 'https://android.cloudapp.ind.in/cloth_store/delivery_locations/delivery_locations_list/2020';
  
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }
  
  fetchData(): void {
    // Implement your data fetching logic here
    forkJoin({
      stores: this.http.get<Store[]>(this.storeApi),
      locations: this.http.get<DeliveryLocation[]>(this.deliveryApi)
    }).subscribe({
      next: (data) => {
        this.stores = data.stores;
        this.deliveryLocations = data.locations;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load data';
        this.loading = false;
        console.error('Error fetching data:', error);
      }
    });
  }

  trackByStore(index: number, store: Store): number {
    return store.store_id;
  }

  trackByLocation(index: number, location: DeliveryLocation): number {
    return location.location_id;
  }
  
  toggleStore(storeId: number): void {
    this.expandedStoreId = this.expandedStoreId === storeId ? null : storeId;
    this.cdr.detectChanges();
  }

  toggleLocation(locationId: number): void {
    this.expandedLocation = this.expandedLocation === locationId ? null : locationId;
    this.cdr.detectChanges();
  }
  
  getStoreDeliveryLocations(storeId: number): DeliveryLocation[] {
    return this.deliveryLocations.filter(loc => loc.store_id === storeId);
  }

  // Add these missing methods
  getDriveImageUrl(imagePath: string): string {
    // Implement your image URL transformation logic
    return imagePath;
  }

  onImageError(event: Event, fallbackType: string): void {
    const imgElement = event.target as HTMLImageElement;
    // Implement your fallback image logic
    imgElement.src = 'https://randomuser.me/api/portraits/women/64.jpg';
  }

  maskPhone(phone: string): string {
    // Implement phone masking logic
    return phone; // Return masked phone number
  }
}