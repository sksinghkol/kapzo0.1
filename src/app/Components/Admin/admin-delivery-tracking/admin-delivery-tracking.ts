import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Booking {
  booking_id: string;
  customer_name?: string;
}

interface DeliveryTracking {
  tracking_id?: string;
  booking_id: string;
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'ready_for_pickup' | 'picked_up' | '';
  description: string;
  tracking_timestamp: string;
}

@Component({
  selector: 'app-admin-delivery-tracking',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-delivery-tracking.html',
  styleUrl: './admin-delivery-tracking.scss'
})
export class AdminDeliveryTracking implements OnInit {
  private baseApi = 'https://android.cloudapp.ind.in/cloth_store';
  private shopCode = '2020';

  bookings: Booking[] = [];
  trackingList: DeliveryTracking[] = [];

  statuses: string[] = ['processing', 'shipped', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'picked_up'];

  newTracking: DeliveryTracking = { booking_id: '', status: '', description: '', tracking_timestamp: '' };
  editMode = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadTracking();
  }

  // Load bookings for dropdown
  loadBookings() {
    this.http.get<Booking[]>(`${this.baseApi}/bookings/bookings_list/${this.shopCode}`)
      .subscribe({ next: data => this.bookings = data });
  }

  // Load all delivery tracking entries
  loadTracking() {
    this.http.get<DeliveryTracking[]>(`${this.baseApi}/delivery_tracking/delivery_tracking_list/${this.shopCode}`)
      .subscribe({ next: data => this.trackingList = data });
  }

  // Add or update tracking
  saveTracking() {
    if (!this.newTracking.booking_id || !this.newTracking.status || !this.newTracking.description || !this.newTracking.tracking_timestamp) {
      alert('Please fill all fields');
      return;
    }

    const url = this.editMode
      ? `${this.baseApi}/delivery_tracking/edit_delivery_tracking`
      : `${this.baseApi}/delivery_tracking/add_delivery_tracking`;

    const payload = { ...this.newTracking, shop_code: this.shopCode };

    this.http.post(url, payload).subscribe({
      next: () => {
        this.loadTracking();
        this.resetForm();
        alert(`Tracking ${this.editMode ? 'updated' : 'added'} successfully`);
      },
      error: err => console.error('Error saving tracking:', err)
    });
  }

  // Edit existing tracking
  editTracking(tracking: DeliveryTracking) {
    this.newTracking = { ...tracking };
    this.editMode = true;
  }

  // Delete tracking
  deleteTracking(tracking_id: string | undefined) {
    if (!tracking_id) return;
    if (!confirm('Are you sure you want to delete this tracking entry?')) return;

    this.http.post(`${this.baseApi}/delivery_tracking/delete_delivery_tracking`, { tracking_id, shop_code: this.shopCode })
      .subscribe({ next: () => this.loadTracking() });
  }

  // Reset form
  resetForm() {
    this.newTracking = { booking_id: '', status: '', description: '', tracking_timestamp: '' };
    this.editMode = false;
  }

  // Display booking id safely
  getBookingName(booking_id: string) {
    const b = this.bookings.find(bk => bk.booking_id === booking_id);
    return b ? b.booking_id : '-';
  }

  // Format status for display
  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : '-';
  }
}