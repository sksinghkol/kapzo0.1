import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, User } from '../../core/services/auth.service';
export interface LoginUser {
  user_id: string;
  username: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
  status: string;
  shop_code: string;
  last_login?: string;
  previous_last_login?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [
 CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  message = '';

  constructor(private auth: AuthService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.message = nav?.extras.state?.['message'] || '';
  }

  onLogin() {
    const emailTrimmed = this.email.trim().toLowerCase();
    const passwordTrimmed = this.password.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      this.error = 'Please enter both Email and Password';
      return;
    }

    this.auth.login(emailTrimmed, passwordTrimmed).subscribe(users => {
      const user = users.find(u =>
        u.email?.toLowerCase() === emailTrimmed &&
        u.password === passwordTrimmed
      );

      if (user) {
        // 1️⃣ Save previous login
        this.auth.saveUser(user);

        // 2️⃣ Update current last_login
        this.auth.updateLastLogin(user).subscribe({
          next: () => console.log('Last login updated'),
          error: err => console.error('Last login update failed', err)
        });

        // 3️⃣ Log login history
        this.auth.logLoginHistory(user, 'success', '', navigator.userAgent).subscribe({
          next: () => console.log('Login history saved'),
          error: err => console.error('Login history failed', err)
        });

        // 4️⃣ Redirect based on role
        const role = (user.role || '').toLowerCase();
        if (role === 'admin') this.router.navigate(['/AdminDashboard']);
        else this.router.navigate(['/UserDashboard']);

      } else {
        // Failed login (user_id=0 for unknown)
        this.auth.logLoginHistory({ email: emailTrimmed, role: 'unknown', user_id: 0 }, 'failure').subscribe();
        this.error = 'Invalid credentials';
      }
    }, err => {
      this.error = 'Login failed';
      console.error(err);
    });
  }
}