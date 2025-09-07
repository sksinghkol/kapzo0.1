import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Watchlist, WatchlistItem, Product } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private platformId = inject(PLATFORM_ID);

  private async getFirebaseApp() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { environment } = await import('../../environments/environment');
    return getApps().length ? getApp() : initializeApp(environment.firebase);
  }

  // Create a new watchlist
  async createWatchlist(userId: string, name: string): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return null;
      
      const db = getFirestore(app);
      const watchlist: Omit<Watchlist, 'id'> = {
        userId,
        name,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      const docRef = await addDoc(collection(db, 'watchlists'), watchlist);
      return docRef.id;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      return null;
    }
  }

  // Get user's watchlists
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const q = query(collection(db, 'watchlists'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Watchlist));
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      return [];
    }
  }

  // Add item to watchlist
  async addItemToWatchlist(watchlistId: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    try {
      const { getFirestore, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return false;
      
      const db = getFirestore(app);
      const watchlistRef = doc(db, 'watchlists', watchlistId);
      
      const watchlistItem: WatchlistItem = {
        ...item,
        id: Date.now().toString(), // Simple ID generation
        addedAt: new Date().toISOString()
      };
      
      await updateDoc(watchlistRef, {
        items: arrayUnion(watchlistItem),
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error adding item to watchlist:', error);
      return false;
    }
  }

  // Remove item from watchlist
  async removeItemFromWatchlist(watchlistId: string, itemId: string): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    try {
      const { getFirestore, doc, getDoc, updateDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return false;
      
      const db = getFirestore(app);
      const watchlistRef = doc(db, 'watchlists', watchlistId);
      const watchlistSnap = await getDoc(watchlistRef);
      
      if (!watchlistSnap.exists()) return false;
      
      const watchlist = watchlistSnap.data() as Watchlist;
      const updatedItems = watchlist.items.filter(item => item.id !== itemId);
      
      await updateDoc(watchlistRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error removing item from watchlist:', error);
      return false;
    }
  }

  // Get watchlist with product details
  async getWatchlistWithProducts(watchlistId: string): Promise<(Watchlist & { productsDetails: Product[] }) | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const { getFirestore, doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return null;
      
      const db = getFirestore(app);
      const watchlistRef = doc(db, 'watchlists', watchlistId);
      const watchlistSnap = await getDoc(watchlistRef);
      
      if (!watchlistSnap.exists()) return null;
      
      const watchlist = { id: watchlistSnap.id, ...watchlistSnap.data() } as Watchlist;
      
      // Get product details for all items in watchlist
      const productIds = watchlist.items.map(item => item.productId);
      const productsDetails: Product[] = [];
      
      if (productIds.length > 0) {
        const productsQuery = query(collection(db, 'products'), where('__name__', 'in', productIds));
        const productsSnap = await getDocs(productsQuery);
        
        productsSnap.docs.forEach(doc => {
          productsDetails.push({ id: doc.id, ...doc.data() } as Product);
        });
      }
      
      return { ...watchlist, productsDetails };
    } catch (error) {
      console.error('Error fetching watchlist with products:', error);
      return null;
    }
  }
}