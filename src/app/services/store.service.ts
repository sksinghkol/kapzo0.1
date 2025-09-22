// src/app/services/store.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private platformId = inject(PLATFORM_ID);

  // Helper to get Firestore instance only in browser
  private async getFirestoreIfBrowser() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('StoreService: Firestore access skipped - not in browser');
      return null;
    }

    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    const { getFirestore } = await import('firebase/firestore');
    return getFirestore(app);
  }

  async addStore(store: any) {
    const db = await this.getFirestoreIfBrowser();
    if (!db) return null;
    const { collection, addDoc } = await import('firebase/firestore');
    return addDoc(collection(db, 'stores'), store);
  }

  async addProduct(product: any) {
    const db = await this.getFirestoreIfBrowser();
    if (!db) return null;
    const { collection, addDoc } = await import('firebase/firestore');
    return addDoc(collection(db, 'products'), product);
  }

  async getStores() {
    const db = await this.getFirestoreIfBrowser();
    if (!db) return [];
    const { collection, getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db, 'stores'));
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  // Find a store by owner UID or email. Returns first matching store or null.
  async getStoreByOwner(owner: string) {
    const db = await this.getFirestoreIfBrowser();
    if (!db) return null;
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    // Try ownerId
    const q1 = query(collection(db, 'stores'), where('ownerId', '==', owner));
    let snapshot = await getDocs(q1);
    if (snapshot.docs.length) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // Try ownerUid
    const q2 = query(collection(db, 'stores'), where('ownerUid', '==', owner));
    snapshot = await getDocs(q2);
    if (snapshot.docs.length) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // Fallback: try email match
    const q3 = query(collection(db, 'stores'), where('email', '==', owner));
    snapshot = await getDocs(q3);
    if (snapshot.docs.length) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    return null;
  }

  async getProductsByStore(storeId: string) {
    const db = await this.getFirestoreIfBrowser();
    if (!db) return [];
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const q = query(collection(db, 'products'), where('storeId', '==', storeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}
