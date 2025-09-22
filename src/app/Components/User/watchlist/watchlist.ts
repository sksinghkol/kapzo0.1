import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WatchlistService } from '../../../services/watchlist.service';
import { ServiceRequestService } from '../../../services/service-request.service';
import { EnhancedStoreService } from '../../../services/enhanced-store.service';
import { FirebaseService } from '../../../services/firebase.service';
import { Watchlist, Address } from '../../../models/interfaces';

declare var bootstrap: any;

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './watchlist.html',
  styleUrls: ['./watchlist.scss']
})
export class WatchlistComponent implements OnInit {
  watchlists: Watchlist[] = [];
  availableCities: string[] = [];
  selectedCity: string = '';
  newWatchlistName: string = '';
  
  // Service request form
  selectedWatchlistId: string = '';
  selectedServiceType: 'quick_service' | 'home_visit' | 'shop_visit' | '' = '';
  scheduledTime: string = '';
  customerAddress: Address = {
    pincode: '',
    city: '',
    state: '',
    country: '',
    locality: '',
    landmark: ''
  };

  private currentUserId: string = '';
  private productCache: { [key: string]: string } = {};

  constructor(
    private watchlistService: WatchlistService,
    private serviceRequestService: ServiceRequestService,
    private storeService: EnhancedStoreService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadAvailableCities();
    await this.loadWatchlists();
  }

  private async loadCurrentUser() {
    const user = await this.firebaseService.getCurrentUser();
    if (user) {
      this.currentUserId = user.uid;
      
      // Load user profile to get address
      const profile = await this.firebaseService.getUserProfile(user.uid);
      if (profile?.address) {
        this.customerAddress = { ...profile.address };
        this.selectedCity = profile.address.city;
      }
    }
  }

  private async loadAvailableCities() {
    this.availableCities = await this.storeService.getAvailableCities();
  }

  private async loadWatchlists() {
    if (this.currentUserId) {
      this.watchlists = await this.watchlistService.getUserWatchlists(this.currentUserId);
    }
  }

  onCityChange() {
    // Update user's selected city and reload relevant data
    this.customerAddress.city = this.selectedCity;
  }

  async createWatchlist() {
    if (!this.newWatchlistName.trim() || !this.currentUserId) return;

    const watchlistId = await this.watchlistService.createWatchlist(
      this.currentUserId,
      this.newWatchlistName.trim()
    );

    if (watchlistId) {
      this.newWatchlistName = '';
      await this.loadWatchlists();
      
      // Close modal (only in browser)
      if (typeof document !== 'undefined' && typeof bootstrap !== 'undefined') {
        const modal = document.getElementById('createWatchlistModal');
        if (modal) {
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) bsModal.hide();
        }
      }
      
      // Navigate to the new watchlist
      this.router.navigate(['/UserDashboard/watchlist', watchlistId]);
    }
  }

  viewWatchlist(watchlistId: string) {
    this.router.navigate(['/UserDashboard/watchlist', watchlistId]);
  }

  requestService(watchlistId: string) {
    this.selectedWatchlistId = watchlistId;
    this.selectedServiceType = '';
    this.scheduledTime = '';
    
    // Show service request modal (only in browser)
    if (typeof document !== 'undefined' && typeof bootstrap !== 'undefined') {
      const modalEl = document.getElementById('serviceRequestModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    }
  }

  async submitServiceRequest() {
    if (!this.selectedServiceType || !this.selectedWatchlistId) return;

    // Find the store ID from the watchlist items
    const watchlist = this.watchlists.find(w => w.id === this.selectedWatchlistId);
    if (!watchlist || watchlist.items.length === 0) return;

    // For now, use the first item's store ID (in a real app, you might need to handle multiple stores)
    const storeId = watchlist.items[0].storeId;

    const requestId = await this.serviceRequestService.createServiceRequest(
      this.currentUserId,
      this.selectedWatchlistId,
      storeId,
      this.selectedServiceType,
      this.customerAddress,
      this.scheduledTime || undefined
    );

    if (requestId) {
      // Close modal (only in browser)
      if (typeof document !== 'undefined' && typeof bootstrap !== 'undefined') {
        const modal = document.getElementById('serviceRequestModal');
        if (modal) {
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) bsModal.hide();
        }
      }

      alert('Service request submitted successfully!');
      this.router.navigate(['/UserDashboard/service-requests']);
    }
  }

  getProductName(productId: string): string {
    return this.productCache[productId] || 'Loading...';
  }
}