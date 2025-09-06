import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getApp, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private db: any;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  async addProduct(product: any) {
    return addDoc(collection(this.db, 'products'), product);
  }

  async getProductsByStore(storeId: string) {
    const q = query(collection(this.db, 'products'), where('storeId', '==', storeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
