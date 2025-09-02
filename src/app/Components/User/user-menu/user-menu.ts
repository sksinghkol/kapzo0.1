import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './../../../core/services/auth.service';
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink ],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss'
})
export class UserMenu implements OnInit {
  cartItemCount = 3;

  username: string = 'Guest';
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
