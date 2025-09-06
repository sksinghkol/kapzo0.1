import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfile implements OnInit {
  user: any = {};
  isEditing = false;
  safeProfilePic!: SafeUrl;

  constructor(private firebaseService: FirebaseService, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    const authUser = await this.firebaseService.getCurrentUser();

    if (authUser) {
      this.user.uid = authUser.uid;
      this.user.name = authUser.displayName || '';
      this.user.email = authUser.email || '';
      this.user.profilePic = authUser.photoURL || '';

      // Sanitize the photo URL
      this.safeProfilePic = this.user.profilePic
        ? this.sanitizer.bypassSecurityTrustUrl(this.user.profilePic)
        : 'assets/default-avatar.png';

      // Fetch Firestore profile
      const profile = await this.firebaseService.getUserProfile(authUser.uid);

      if (profile) {
        this.user = { ...this.user, ...profile };
      } else {
        // Create new profile if none exists
        const newProfile = {
          name: this.user.name,
          email: this.user.email,
          phone: '',
          address: {
            pincode: '',
            locality: '',
            city: '',
            state: '',
            country: '',
            landmark: ''
          },
          memberSince: new Date().toISOString()
        };
        await this.firebaseService.updateUserProfile(authUser.uid, newProfile);
        this.user = { ...this.user, ...newProfile };
      }
    }
  }

  enableEdit() {
    this.isEditing = true;
  }

  async saveProfile() {
    await this.firebaseService.updateUserProfile(this.user.uid, this.user);
    this.isEditing = false;
    alert('Profile updated successfully!');
  }
}

