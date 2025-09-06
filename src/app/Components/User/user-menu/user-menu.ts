
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from './../../../services/firebase.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss'
})
export class UserMenu implements OnInit {
  username: string | null = null;
  photoURL: string | null = null;
  phoneNumber: string | null = null;
  cartItemCount = 0;

  constructor(private fb: FirebaseService, private router: Router) {}

  ngOnInit(): void {
    // ✅ Listen for auth changes
    this.fb.getCurrentUser().then(user => {
      if (user) {
        this.username = user.displayName || user.email?.split('@')[0] || 'User';
        this.photoURL = user.photoURL || 'https://dummyimage.com/400x400/444444/d3d3d3.png';
        this.phoneNumber = user.phoneNumber || '';
      }
    });
  }

  async logout() {
    await this.fb.logout();
    this.username = null;
    this.photoURL = null;
    this.router.navigate(['/login']);
  }
}