import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ServiceRequest, Address } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {
  private platformId = inject(PLATFORM_ID);

  private async getFirebaseApp() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { environment } = await import('../../environments/environment');
    return getApps().length ? getApp() : initializeApp(environment.firebase);
  }

  // Create a service request
  async createServiceRequest(
    userId: string,
    watchlistId: string,
    storeId: string,
    type: 'home_visit' | 'quick_service' | 'shop_visit',
    customerAddress: Address,
    scheduledTime?: string
  ): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return null;
      
      const db = getFirestore(app);
      const serviceRequest: Omit<ServiceRequest, 'id'> = {
        userId,
        watchlistId,
        storeId,
        type,
        customerAddress,
        scheduledTime,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'service_requests'), serviceRequest);
      return docRef.id;
    } catch (error) {
      console.error('Error creating service request:', error);
      return null;
    }
  }

  // Get user's service requests
  async getUserServiceRequests(userId: string): Promise<ServiceRequest[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const q = query(
        collection(db, 'service_requests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceRequest));
    } catch (error) {
      console.error('Error fetching user service requests:', error);
      return [];
    }
  }

  // Get store's service requests
  async getStoreServiceRequests(storeId: string): Promise<ServiceRequest[]> {
    if (!isPlatformBrowser(this.platformId)) return [];
    
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return [];
      
      const db = getFirestore(app);
      const q = query(
        collection(db, 'service_requests'),
        where('storeId', '==', storeId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceRequest));
    } catch (error) {
      console.error('Error fetching store service requests:', error);
      return [];
    }
  }

  // Update service request status
  async updateServiceRequestStatus(
    requestId: string,
    status: ServiceRequest['status'],
    additionalData?: Partial<ServiceRequest>
  ): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return false;
      
      const db = getFirestore(app);
      const requestRef = doc(db, 'service_requests', requestId);
      
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'accepted') {
        updateData.acceptedAt = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      
      if (additionalData) {
        Object.assign(updateData, additionalData);
      }
      
      await updateDoc(requestRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating service request status:', error);
      return false;
    }
  }

  // Complete service request with purchase details
  async completeServiceRequest(
    requestId: string,
    purchasedItems: string[],
    rejectedItems: string[],
    totalAmount: number,
    notes?: string
  ): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) return false;
      
      const db = getFirestore(app);
      const requestRef = doc(db, 'service_requests', requestId);
      
      await updateDoc(requestRef, {
        status: 'completed',
        purchasedItems,
        rejectedItems,
        totalAmount,
        notes,
        completedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error completing service request:', error);
      return false;
    }
  }
}