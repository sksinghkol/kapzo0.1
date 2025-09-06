import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService, StoreUser } from '../../../services/firebase.service';

@Component({
  selector: 'app-store-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './storelogin.html',
  styleUrls: ['./storelogin.scss']
})
export class Storelogin {
  error = '';
  loading = false;

  constructor(private fb: FirebaseService, private router: Router) {}

  // --- Google Login ---
  async loginWithGoogle() {
    this.error = '';
    this.loading = true;
    try {
      const result = await this.fb.loginWithGoogle();
      const authUser = result.user;

      // Prepare store user data
      const storeUser: StoreUser = {
        name: authUser.displayName || 'Store User',
        email: authUser.email!,
        phone: '',
        address: { pincode:'', city:'', state:'', country:'', locality:'', landmark:'' },
        memberSince: new Date().toISOString(),
        roles: ['store'],
        status: 'active',
        products: []
      };

      // Save in store_user collection
      await this.fb.createOrUpdateStoreUser(authUser.uid, storeUser);

      // Save store details in stores collection
      const storeDetails = {
        ownerUid: authUser.uid,
        name: storeUser.name,
        email: storeUser.email,
        createdAt: new Date().toISOString(),
        products: []
      };
      await this.fb.createOrUpdateStore(authUser.uid, storeDetails);

      // Redirect to dashboard
      this.router.navigate(['/StoreDashboard']);
    } catch (err: any) {
      console.error(err);
      this.error = err.message || 'Google login failed';
    } finally {
      this.loading = false;
    }
  }
}
