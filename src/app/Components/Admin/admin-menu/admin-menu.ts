import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.scss'
})
export class AdminMenu implements OnInit {
  cartItemCount = 3;

  username: string = 'Admin';
  phoneNumber: string = '';

  constructor(private auth: AuthService) {} // ✅ inject AuthService

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.username = user.username;
      this.phoneNumber = user.phone_number;
    }
  }
}

