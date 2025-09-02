import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, HttpClientModule ,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
private apiUrl = 'https://android.cloudapp.ind.in/cloth_store/users/add_users/';

  user = {
   
    username: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    shop_code: '2020',   // fixed
    role: 'customer',    // fixed
    last_login: '',
    created_at: ''
  };

  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const now = new Date().toISOString();
    this.user.created_at = now;
    this.user.last_login = now;

    this.http.post(this.apiUrl, this.user).subscribe({
      next: () => {
        // redirect to login with message
        this.router.navigate(['/login'], {
          state: { message: 'Thank you for signing up! Please log in to continue.' }
        });
      },
      error: (err) => {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error(err);
      }
    });
  }
}
