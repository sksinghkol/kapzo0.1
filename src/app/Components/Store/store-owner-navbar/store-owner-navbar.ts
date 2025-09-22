import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { StoreService } from '../../../services/store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store-owner-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store-owner-navbar.html',
  styleUrls: ['./store-owner-navbar.scss']
})
export class StoreOwnerNavbar implements OnInit {
  store: any = null;
  loading = true;

  private sub: Subscription | null = null;

  constructor(private firebaseService: FirebaseService, private storeService: StoreService, private router: Router) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit() {
    // subscribe to auth state so the navbar updates immediately when user logs in/out
    this.sub = this.firebaseService.authState$.subscribe(async (user) => {
      console.debug('[StoreOwnerNavbar] authState$ emission:', user);
      this.loading = true;
      try {
        if (!user) {
          this.store = null;
          this.loading = false;
          return;
        }

  const storeByUid = await this.storeService.getStoreByOwner(user.uid);
  const storeByEmail = !storeByUid ? await this.storeService.getStoreByOwner(user.email || '') : null;
  this.store = storeByUid || storeByEmail || null;
  console.debug('[StoreOwnerNavbar] matched store:', this.store);
      } catch (err) {
        console.error('Error loading store for navbar', err);
        this.store = null;
      }
      this.loading = false;
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/']);
  }
}
