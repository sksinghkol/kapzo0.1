import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/interfaces';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfile implements OnInit {
  user: User = {
    uid: '',
    name: '',
    email: '',
    phone: '',
    address: {
      pincode: '',
      city: '',
      state: '',
      country: 'India',
      locality: '',
      landmark: '',
      addressLine: ''
    },
    memberSince: new Date().toISOString(),
    role: 'customer',
    status: 'active'
  } as User;
  isEditing = false;
  safeProfilePic!: SafeUrl;
  states: string[] = [];
  cities: string[] = [];
  statesLoaded = false;

  // Loaded from asset
  private stateCityMap: { [state: string]: string[] } = {};
  // Small fallback map in case asset fails
  private fallbackStateCityMap: { [state: string]: string[] } = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Karnataka': ['Bengaluru', 'Mysore', 'Mangalore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
    'Delhi': ['New Delhi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra']
  };

  constructor(
    private firebaseService: FirebaseService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    // Only run browser-specific code (HttpClient asset load and Firebase auth) in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Load state/city mapping from asset
      try {
        const map = await firstValueFrom(this.http.get<{ [k: string]: string[] }>('assets/india-states-cities.json'));
        if (map && Object.keys(map).length) {
          this.stateCityMap = map;
        }
      } catch (err) {
        console.warn('Could not load states/cities asset, will use fallback map', err);
      }

      // If load failed or empty, use fallback
      if (!Object.keys(this.stateCityMap).length) {
        this.stateCityMap = this.fallbackStateCityMap;
      }

      // Populate states now that map is available
      this.states = Object.keys(this.stateCityMap);
      this.statesLoaded = true;

      const authUser = await this.firebaseService.getCurrentUser();

      if (authUser) {
        this.user.uid = authUser.uid;
        this.user.name = authUser.displayName || '';
        this.user.email = authUser.email || '';
        // profilePic is optional and not part of the core User interface; store locally on the object
        (this.user as any).profilePic = authUser.photoURL || '';

        // Sanitize the photo URL (profilePic may be stored as an any property)
        const pic = (this.user as any).profilePic || '';
        this.safeProfilePic = pic
          ? this.sanitizer.bypassSecurityTrustUrl(pic)
          : 'assets/default-avatar.png';

        // Fetch Firestore profile
        const profile = await this.firebaseService.getUserProfile(authUser.uid);

        if (profile) {
          // profile may be a partial User object from Firestore — deep-merge address so we don't lose addressLine
          const partial = profile as Partial<User>;
          this.user = {
            ...this.user,
            ...partial,
            address: {
              ...this.user.address,
              ...(partial.address || {})
            }
          } as User;
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
            landmark: '',
            addressLine: ''
            },
            memberSince: new Date().toISOString()
          };
          await this.firebaseService.updateUserProfile(authUser.uid, newProfile);
          this.user = { ...this.user, ...newProfile };
        }
      }
    } else {
      // Server-side: leave stateCityMap empty to avoid HttpClient usage on server
      this.stateCityMap = {};
    }

  // Initialize default country (states set above in browser path)
    if (!this.user.address) this.user.address = {
      pincode: '', city: '', state: '', country: 'India', locality: '', landmark: '', addressLine: ''
    };
    if (!this.user.address.country) this.user.address.country = 'India';
    // If state present, populate cities list
    if (this.user.address.state) {
      this.onStateChange(this.user.address.state);
    }
  }

  enableEdit() {
    this.isEditing = true;
  }

  async saveProfile() {
    // Basic client-side validation
    const phoneRegex = /^\d{10}$/; // simple 10-digit check
    const pincodeRegex = /^\d{6}$/; // 6-digit Indian pincode

    if (this.user.phone && !phoneRegex.test(this.user.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (this.user.address.pincode && !pincodeRegex.test(this.user.address.pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    // Persist profile (addressLine will be included in address)
    try {
      console.log('Saving profile, address:', this.user.address);
      await this.firebaseService.updateUserProfile(this.user.uid, this.user as any);
      this.isEditing = false;
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. See console for details.');
    }
  }

  onStateChange(state: string) {
    if (state && this.stateCityMap[state]) {
      this.cities = this.stateCityMap[state];
      // If current city is not in the new list, clear it
      if (!this.cities.includes(this.user.address.city)) {
        this.user.address.city = '';
      }
    } else {
      this.cities = [];
    }
  }
}

