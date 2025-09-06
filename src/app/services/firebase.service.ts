import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Address {
  pincode: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  landmark: string;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  address: Address;
  memberSince: string;
  role?: string; 
  status?: string; 
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private auth: any;
  private platformId = inject(PLATFORM_ID);

  // Initialize Firebase App
  private async getFirebaseApp() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Firebase app initialization skipped: Not in browser context');
      return null;
    }

    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { environment } = await import('../../environments/environment');

    return getApps().length ? getApp() : initializeApp(environment.firebase);
  }

  // Get Auth Instance
  private async getAuth() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Auth initialization skipped: Not in browser context');
      return null;
    }

    if (!this.auth) {
      const app = await this.getFirebaseApp();
      if (!app) {
        console.error('Firebase app not initialized');
        return null;
      }
      const { getAuth } = await import('firebase/auth');
      this.auth = getAuth(app);
    }
    return this.auth;
  }

  // Current User
  async getCurrentUser(): Promise<any> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('getCurrentUser skipped: Not in browser context');
      return null;
    }
    const auth = await this.getAuth();
    if (!auth) {
      console.error('Auth not initialized');
      return null;
    }

    return new Promise<any>((resolve, reject) => {
      auth.onAuthStateChanged((user: any) => resolve(user || null), reject);
    });
  }

  // Login with Email/Password
  async login(email: string, password: string) {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Login only in browser');
    }
    const auth = await this.getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  async loginWithGoogle() {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Login only in browser');
    }
    const auth = await this.getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Logout
  async logout() {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Logout skipped: Not in browser context');
      return;
    }
    const auth = await this.getAuth();
    if (!auth) {
      console.warn('Auth not initialized');
      return;
    }
    const { signOut } = await import('firebase/auth');
    return signOut(auth);
  }

  // Get User Profile
  async getUserProfile(uid: string): Promise<Profile | null> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('getUserProfile skipped: Not in browser context');
      return null;
    }
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const app = await this.getFirebaseApp();
    if (!app) {
      console.error('Firebase app not initialized');
      return null;
    }
    const db = getFirestore(app);
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Profile) : null;
  }

  // Update / Create User Profile
  async updateUserProfile(uid: string, data: Profile): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('updateUserProfile skipped: Not in browser context');
      return;
    }
    try {
      const { getFirestore, doc, setDoc, updateDoc, getDoc } = await import('firebase/firestore');
      const app = await this.getFirebaseApp();
      if (!app) {
        throw new Error('Firebase app not initialized');
      }
      const db = getFirestore(app);
      const docRef = doc(db, 'users', uid);

      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(docRef, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          memberSince: data.memberSince,
        });
      } else {
        // Create new document
        await setDoc(docRef, data);
      }
      console.log('Profile updated successfully for UID:', uid);
    } catch (err) {
      console.error('Firestore update error:', err);
      throw err;
    }
  }

  // Add Generic Data (any collection)
  async addData(collectionName: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('addData skipped: Not in browser context');
      return null;
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const app = await this.getFirebaseApp();
    if (!app) {
      console.error('Firebase app not initialized');
      return null;
    }
    const db = getFirestore(app);
    const colRef = collection(db, collectionName);
    return addDoc(colRef, data);
  }

  // Upload File to Firebase Storage (Spark plan safe)
async uploadFile(path: string, file: File): Promise<string | null> {
  if (!isPlatformBrowser(this.platformId)) return null;

  // File size check: Spark plan max 5 MB
  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    console.error(`File too large: ${file.name}, max 5 MB allowed.`);
    alert(`File too large: ${file.name}, max 5 MB allowed.`);
    return null;
  }

  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const app = await this.getFirebaseApp();
  if (!app) return null;

  const storage = getStorage(app);
  const storageRef = ref(storage, path);

  try {
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error('Upload failed:', err);
    alert(`Upload failed: ${file.name}`);
    return null;
  }
}
}