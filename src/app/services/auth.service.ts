import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: any;
  private db: any;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const app = initializeApp(environment.firebase);
      this.auth = getAuth(app);
      this.db = getFirestore(app);
    }
  }

  // Current logged-in user
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => resolve(user));
    });
  }

  // Google login
  async loginWithGoogle(): Promise<User | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async logout() {
    if (!isPlatformBrowser(this.platformId)) return;
    return signOut(this.auth);
  }

  // Save extra info to Firestore
  async saveUserProfile(user: User, extraData: { address?: string; location?: string; phone?: string }) {
    if (!user) return;
    const docRef = doc(this.db, 'users', user.uid);
    await setDoc(docRef, { 
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      ...extraData
    }, { merge: true });
  }
}
