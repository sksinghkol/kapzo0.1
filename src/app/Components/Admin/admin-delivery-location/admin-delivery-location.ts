import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface DeliveryLocation {
  location_id?: string;
  location_name: string;
  description: string;
  is_store_pickup: boolean;
  created_at?: string;
  isEditing?: boolean;
}

@Component({
  selector: 'app-admin-delivery-location',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-delivery-location.html',
  styleUrl: './admin-delivery-location.scss'
})
export class AdminDeliveryLocation implements OnInit {
  locations: DeliveryLocation[] = [];
  private shopCode = '2020';
  private baseUrl = 'https://android.cloudapp.ind.in/cloth_store/delivery_locations';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLocations();
  }

  // Load locations
  loadLocations() {
    this.http.get<DeliveryLocation[]>(`${this.baseUrl}/delivery_locations_list/${this.shopCode}`).subscribe({
      next: (res) => {
        this.locations = res.map(l => ({ ...l, isEditing: false }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  // Add new row
  addRow() {
    this.locations.push({
      location_name: '',
      description: '',
      is_store_pickup: false,
      isEditing: true
    });
  }

  // Start editing
  editRow(loc: DeliveryLocation) {
    loc.isEditing = true;
  }

  // Cancel editing
  cancelEdit(loc: DeliveryLocation) {
    if (!loc.location_id) {
      this.locations = this.locations.filter(l => l !== loc);
    } else {
      loc.isEditing = false;
      this.loadLocations(); // reload original data
    }
  }

  // Save or update location
  saveLocation(loc: DeliveryLocation) {
    if (!loc.location_name) {
      alert('Location Name is required.');
      return;
    }

    const url = loc.location_id
      ? `${this.baseUrl}/edit_delivery_locations`
      : `${this.baseUrl}/add_delivery_locations`;

    const payload = {
      location_id: loc.location_id,
      location_name: loc.location_name,
      description: loc.description,
      is_store_pickup: loc.is_store_pickup ? 1 : 0,
      shop_code: this.shopCode
    };

    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        if (!loc.location_id && res?.location_id) {
          loc.location_id = res.location_id;
        }
        loc.isEditing = false;
        alert(`Location ${loc.location_id ? 'updated' : 'added'} successfully`);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving location:', err);
        alert(`Failed to save location: ${err.status} - ${err.message}`);
      }
    });
  }

  // Delete location
  confirmDelete(index: number) {
    const loc = this.locations[index];
    if (!confirm('Are you sure you want to delete this location?')) return;

    if (loc.location_id) {
      this.http.post(`${this.baseUrl}/delete_delivery_locations`, { location_id: loc.location_id, shop_code: this.shopCode }).subscribe({
        next: () => {
          this.locations.splice(index, 1);
          alert('Location deleted successfully');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting location:', err);
          alert(`Failed to delete location: ${err.status} - ${err.message}`);
        }
      });
    } else {
      this.locations.splice(index, 1);
    }
  }
}