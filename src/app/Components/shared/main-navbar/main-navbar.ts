import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { StoreService } from '../../../services/store.service';
import { UserMenu } from '../../User/user-menu/user-menu';
import { StoreOwnerNavbar } from '../../Store/store-owner-navbar/store-owner-navbar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenu, StoreOwnerNavbar],
  template: `
    <ng-container *ngIf="loading">Loading...</ng-container>
    <ng-container *ngIf="!loading">
      <app-store-owner-navbar *ngIf="isStoreOwner"></app-store-owner-navbar>
      <app-user-menu *ngIf="!isStoreOwner"></app-user-menu>
    </ng-container>
  `
})
export class MainNavbar implements OnInit, OnDestroy {
  loading = true;
  isStoreOwner = false;
  private sub: Subscription | null = null;

  constructor(private fb: FirebaseService, private storeService: StoreService) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit() {
    // Subscribe to auth changes and recompute role
    this.sub = this.fb.authState$.subscribe(async (user) => {
      console.debug('[MainNavbar] authState$ emission:', user);
      this.loading = true;
      try {
        if (!user) {
          this.isStoreOwner = false;
          this.loading = false;
          return;
        }

        const profile = await this.fb.getUserProfile(user.uid);
        console.debug('[MainNavbar] loaded profile:', profile);
        if (profile && (profile as any).role === 'seller') {
          this.isStoreOwner = true;
        } else {
          // Try a targeted lookup by owner uid/email for better performance and reliability
          const storeByUid = await this.storeService.getStoreByOwner(user.uid);
          const storeByEmail = !storeByUid ? await this.storeService.getStoreByOwner(user.email || '') : null;
          this.isStoreOwner = !!(storeByUid || storeByEmail);
          console.debug('[MainNavbar] isStoreOwner after targeted lookup:', this.isStoreOwner, { storeByUid, storeByEmail });
        }
      } catch (err) {
        console.error('Error resolving navbar role', err);
        this.isStoreOwner = false;
      }
      this.loading = false;
    });
  }
}
