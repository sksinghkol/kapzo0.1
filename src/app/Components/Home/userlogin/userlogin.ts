import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-userlogin',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './userlogin.html',
  styleUrl: './userlogin.scss'
})
export class Userlogin implements OnInit {
  email = '';
  password = '';
  error = '';
  loading = true;

  private returnUrl: string | null = null;
  constructor(private fb: FirebaseService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // capture returnUrl if provided by AuthGuard
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.fb.getCurrentUser().then(user => {
      if (user) this.router.navigate([this.returnUrl || '/UserDashboard']);
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  async login() {
    this.error = '';
    this.loading = true;

    try {
      const userCredential = await this.fb.login(this.email, this.password);
      const user = userCredential.user;

      // Fetch all profiles with this email
      const customerProfile = await this.fb.getUserProfile(user.uid);

      if (!customerProfile) {
        // If no profile exists, create default customer
        const profile = {
          name: user.displayName || 'Customer',
          email: user.email!,
          phone: '',
          address: { pincode:'', city:'', state:'', country:'', locality:'', landmark:'' },
          memberSince: new Date().toISOString(),
          role: 'customer',
          status: 'active'
        };
        await this.fb.updateUserProfile(user.uid, profile);
        this.router.navigate(['/UserDashboard']);
        return;
      }

      // Check if status is active
      if (customerProfile.status !== 'active') {
        this.error = 'Your account is not active. Contact admin.';
        await this.fb.logout();
        return;
      }

      // Wait reactively for authState$ to emit a non-null user (timeout ignored here)
      try {
        const { firstValueFrom } = await import('rxjs');
        const { filter } = await import('rxjs/operators');
        await firstValueFrom(this.fb.authState$.pipe(filter((u: any) => !!u)));
      } catch (e) {
        // proceed regardless
      }
  this.router.navigate([this.returnUrl || '/UserDashboard']);

    } catch (err: any) {
      this.error = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.error = '';
    this.loading = true;

    try {
      const result = await this.fb.loginWithGoogle();
      const user = result.user;

      // Fetch user profile
      const existingProfile = await this.fb.getUserProfile(user.uid);

      if (!existingProfile) {
        const profile = {
          name: user.displayName || 'Customer',
          email: user.email!,
          phone: '',
          address: { pincode:'', city:'', state:'', country:'', locality:'', landmark:'' },
          memberSince: new Date().toISOString(),
          role: 'customer',
          status: 'active'
        };
        await this.fb.updateUserProfile(user.uid, profile);
      } else if (existingProfile.status !== 'active') {
        this.error = 'Your account is not active. Contact admin.';
        await this.fb.logout();
        return;
      }

      try {
        const { firstValueFrom } = await import('rxjs');
        const { filter } = await import('rxjs/operators');
        await firstValueFrom(this.fb.authState$.pipe(filter((u: any) => !!u)));
      } catch (e) {
        // ignore and continue
      }
  this.router.navigate([this.returnUrl || '/UserDashboard']);
    } catch (err: any) {
      this.error = err.message || 'Google login failed';
    } finally {
      this.loading = false;
    }
  }
}
