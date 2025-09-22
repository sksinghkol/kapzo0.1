import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EnhancedStoreService } from '../../../services/enhanced-store.service';
import { WatchlistService } from '../../../services/watchlist.service';
import { FirebaseService } from '../../../services/firebase.service';
import { Product, Store, Watchlist } from '../../../models/interfaces';

declare var bootstrap: any;

@Component({
  selector: 'app-product-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-browser.html',
  styleUrls: ['./product-browser.scss']
})
export class ProductBrowserComponent implements OnInit {
  products: Product[] = [];
  stores: Store[] = [];
  categories: string[] = [];
  availableCities: string[] = [];
  userWatchlists: Watchlist[] = [];

  // Filters
  selectedCity: string = '';
  selectedStoreId: string = '';
  searchTerm: string = '';
  filters = {
    category: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined
  };

  // Watchlist modal
  selectedProduct: Product | null = null;
  selectedWatchlistId: string = '';
  selectedColor: string = '';
  selectedSize: string = '';
  selectedQuantity: number = 1;
  itemNotes: string = '';

  private currentUserId: string = '';
  private watchlistProductIds: Set<string> = new Set();

  constructor(
    private storeService: EnhancedStoreService,
    private watchlistService: WatchlistService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadInitialData();
    await this.loadUserWatchlists();
  }

  private async loadCurrentUser() {
    const user = await this.firebaseService.getCurrentUser();
    if (user) {
      this.currentUserId = user.uid;
      
      // Load user profile to get preferred city
      const profile = await this.firebaseService.getUserProfile(user.uid);
      if (profile?.address?.city) {
        this.selectedCity = profile.address.city;
      }
    }
  }

  private async loadInitialData() {
    this.availableCities = await this.storeService.getAvailableCities();
    this.categories = await this.storeService.getProductCategories();
    
    if (this.selectedCity) {
      await this.loadStoresByCity();
      await this.loadProducts();
    }
  }

  private async loadStoresByCity() {
    if (this.selectedCity) {
      this.stores = await this.storeService.getStoresByCity(this.selectedCity);
    }
  }

  private async loadProducts() {
    if (this.selectedStoreId) {
      // Load products from specific store
      this.products = await this.storeService.getProductsByStore(this.selectedStoreId, this.filters);
    } else if (this.selectedCity) {
      // Load products from all stores in city
      if (this.searchTerm) {
        this.products = await this.storeService.searchProducts(this.searchTerm, this.selectedCity, this.filters);
      } else {
        // Load all products from stores in the city
        const allProducts: Product[] = [];
        for (const store of this.stores) {
          const sid = store.id ?? (store as any).storeId;
          if (!sid) continue; // skip if no id
          const storeProducts = await this.storeService.getProductsByStore(sid, this.filters);
          allProducts.push(...storeProducts);
        }
        this.products = allProducts;
      }
    }
  }

  private async loadUserWatchlists() {
    if (this.currentUserId) {
      this.userWatchlists = await this.watchlistService.getUserWatchlists(this.currentUserId);
      
      // Build set of product IDs that are in watchlists
      this.watchlistProductIds.clear();
      this.userWatchlists.forEach(watchlist => {
        watchlist.items.forEach(item => {
          this.watchlistProductIds.add(item.productId);
        });
      });
    }
  }

  async onFiltersChange() {
    await this.loadStoresByCity();
    await this.loadProducts();
  }

  async onStoreChange() {
    await this.loadProducts();
  }

  async searchProducts() {
    await this.loadProducts();
  }

  clearFilters() {
    this.selectedStoreId = '';
    this.searchTerm = '';
    this.filters = {
      category: '',
      minPrice: undefined,
      maxPrice: undefined
    };
    this.loadProducts();
  }

  isInWatchlist(productId: string): boolean {
    return this.watchlistProductIds.has(productId);
  }

  toggleWatchlist(product: Product) {
    if (this.isInWatchlist(product.id)) {
      // Remove from watchlist (you'd need to implement this)
      alert('Remove from watchlist functionality to be implemented');
    } else {
      // Add to watchlist
      this.selectedProduct = product;
      this.selectedWatchlistId = '';
      this.selectedColor = '';
      this.selectedSize = '';
      this.selectedQuantity = 1;
      this.itemNotes = '';
      // Only access DOM in browser
      if (typeof document !== 'undefined' && typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('addToWatchlistModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      }
    }
  }

  async addToWatchlist() {
    if (!this.selectedProduct || !this.selectedWatchlistId) return;

    const success = await this.watchlistService.addItemToWatchlist(this.selectedWatchlistId, {
      productId: this.selectedProduct.id,
      userId: this.currentUserId,
      storeId: this.selectedProduct.storeId,
      selectedColor: this.selectedColor || undefined,
      selectedSize: this.selectedSize || undefined,
      quantity: this.selectedQuantity,
      notes: this.itemNotes || undefined
    });

    if (success) {
      // Close modal
      if (typeof document !== 'undefined' && typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('addToWatchlistModal');
        if (modalEl) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }
      }

      // Refresh watchlist data
      await this.loadUserWatchlists();
      alert('Product added to watchlist successfully!');
    } else {
      alert('Failed to add product to watchlist. Please try again.');
    }
  }

  viewProduct(product: Product) {
    // Navigate to product details page (to be implemented)
    this.router.navigate(['/UserDashboard/product', product.id]);
  }
}