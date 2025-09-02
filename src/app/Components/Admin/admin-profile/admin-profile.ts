import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

// Define the User interface for type safety
// Define the User interface for type safety
interface User {
  user_id: string;
  username: string;
  email: string;
  phone_number: string;
  address: string;
  role: string;
  last_login: string;
  created_at: string;
  password?: string; 
  previous_last_login?: string; // <-- ✅ Add this
}



@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss'
})
export class AdminProfile implements OnInit{
 apiUrl = 'https://android.cloudapp.ind.in/cloth_store/users/users_list/2020';
  editUrl = 'https://android.cloudapp.ind.in/cloth_store/users/edit_users';

  user: User | null = null;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;

  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message = '';
  success = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loggedInUser = this.auth.getUser();
    if (loggedInUser && loggedInUser.email) {
      this.http.get<User[]>(this.apiUrl).subscribe({
        next: (users) => {
          this.user = users.find((u) => u.email === loggedInUser.email) || null;
        },
        error: (err) => {
          console.error('Failed to fetch user data:', err);
          this.user = null;
        }
      });
    }
  }

  // --- PROFILE EDIT ---
  editProfile(): void {
    this.isEditing = true;
    this.isChangingPassword = false;
  }

  saveProfile(): void {
    if (!this.user) return;

    this.http.post(this.editUrl, {
      ...this.user,
      shop_code: '2020'
    }).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update profile.');
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  // --- CHANGE PASSWORD ---
  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New password and confirm password do not match.';
      this.success = false;
      return;
    }

    if (!this.user) return;

    // Step 1: Fetch existing user details
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users) => {
        const currentUser = users.find(u => u.user_id === this.user?.user_id);

        if (!currentUser) {
          this.message = 'User not found!';
          this.success = false;
          return;
        }

        // Step 2: Verify old password manually
        if (currentUser.password !== this.oldPassword) {
          this.message = 'Old password is incorrect!';
          this.success = false;
          return;
        }

        // Step 3: Call edit API with new password
        const updatedUser = { ...this.user, password: this.newPassword, shop_code: '2020' };

        this.http.post(this.editUrl, updatedUser).subscribe({
          next: () => {
            this.message = 'Password changed successfully!';
            this.success = true;
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.isChangingPassword = false;
          },
          error: () => {
            this.message = 'Error changing password.';
            this.success = false;
          }
        });
      },
      error: () => {
        this.message = 'Error verifying old password.';
        this.success = false;
      }
    });
  }

  cancelPassword(): void {
    this.isChangingPassword = false;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // --- NAVIGATION ---
  goHome(): void {
    this.router.navigate(['/AdminDashboard/']); // <-- go to user home
  }
goUserProfile(): void {
    this.router.navigate(['/AdminDashboard/AdminProfile']); // <-- go to user home
  }
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
  
}
