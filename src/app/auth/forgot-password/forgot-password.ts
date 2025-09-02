import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
email = '';
  message = '';
  loading = false;
  private apiUrl = 'https://android.cloudapp.ind.in/cloth_store/users/forgot_password';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      return;
    }

    this.loading = true;
    this.http.post(this.apiUrl, { email: this.email }).subscribe({
      next: (res: any) => {
        this.message = 'Password reset instructions sent to your email.';
        setTimeout(() => this.router.navigate(['/login']), 3000); // redirect after 3 sec
      },
      error: (err) => {
        console.error('Error:', err);
        this.message = 'Failed to process request. Try again.';
      },
      complete: () => (this.loading = false),
    });
  }
}
