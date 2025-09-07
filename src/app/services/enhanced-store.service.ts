import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store, Product } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class EnhancedStoreService {
  private platformId = inject(PLATFORM_ID);

  private async getFirebaseApp() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { environment } = await import('../../environments/environment');
    return getApps().length ? getApp() : initializeApp(environment.firebase);
  }

  // Get stores by city/delivery location
  async getStoresByCity(city: string): Promise<Store[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const q = query(
        collection(db, 'stores'),
        where('deliveryLocations', 'array-contains', city),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Store));
    } catch (error) {
      console.error('Error fetching stores by city:', error);
      return [];
    }
  }

  // Get stores by category
  async getStoresByCategory(category: string, city?: string): Promise<Store[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      let q = query(
        collection(db, 'stores'),
        where('category', '==', category),
        where('status', '==', 'active')
      );
      
      if (city) {
        q = query(q, where('deliveryLocations', 'array-contains', city));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Store));
    } catch (error) {
      console.error('Error fetching stores by category:', error);
      return [];
    }
  }

  // Get products by store with filters
  async getProductsByStore(
    storeId: string,
    filters?: {
      category?: string;
      subcategory?: string;
      minPrice?: number;
      maxPrice?: number;
      color?: string;
      size?: string;
    }
  ): Promise<Product[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      let q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('status', '==', 'active')
      );
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.subcategory) {
        q = query(q, where('subcategory', '==', filters.subcategory));
      }
      
      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      
      // Apply client-side filters for complex queries
      if (filters) {
        products = products.filter(product => {
          if (filters.minPrice && product.price < filters.minPrice) return false;
          if (filters.maxPrice && product.price > filters.maxPrice) return false;
          if (filters.color && !product.colors.includes(filters.color)) return false;
          if (filters.size && !product.sizes.includes(filters.size)) return false;
          return true;
        });
      }
      
      return products;
    } catch (error) {
      console.error('Error fetching products by store:', error);
      return [];
    }
  }

  // Search products across all stores in a city
  async searchProducts(
    searchTerm: string,
    city: string,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<Product[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      // First get stores in the city
      const stores = await this.getStoresByCity(city);
      const storeIds = stores.map(store => store.id);
      
      if (storeIds.length === 0) return [];
      
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      
      // Get products from these stores
      const allProducts: Product[] = [];
      
      // Firebase 'in' query has a limit of 10, so we need to batch
      const batchSize = 10;
      for (let i = 0; i < storeIds.length; i += batchSize) {
        const batch = storeIds.slice(i, i + batchSize);
        let q = query(
          collection(db, 'products'),
          where('storeId', 'in', batch),
          where('status', '==', 'active')
        );
        
        if (filters?.category) {
          q = query(q, where('category', '==', filters.category));
        }
        
        const snapshot = await getDocs(q);
        const batchProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        allProducts.push(...batchProducts);
      }
      
      // Filter by search term and other filters
      return allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        if (filters?.minPrice && product.price < filters.minPrice) return false;
        if (filters?.maxPrice && product.price > filters.maxPrice) return false;
        
        return true;
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Get available cities (from all stores)
  async getAvailableCities(): Promise<string[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, 'stores'));
      
      const citiesSet = new Set<string>();
      snapshot.docs.forEach(doc => {
        const store = doc.data() as Store;
        if (store.deliveryLocations) {
          store.deliveryLocations.forEach(city => citiesSet.add(city));
        }
      });
      
      return Array.from(citiesSet).sort();
    } catch (error) {
      console.error('Error fetching available cities:', error);
      return [];
    }
  }

  // Get product categories
  async getProductCategories(): Promise<string[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, 'products'));
      
      const categoriesSet = new Set<string>();
      snapshot.docs.forEach(doc => {
        const product = doc.data() as Product;
        if (product.category) {
          categoriesSet.add(product.category);
        }
      });
      
      return Array.from(categoriesSet).sort();
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return [];
    }
  }
}