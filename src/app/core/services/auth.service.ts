import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

export interface User {
  user_id: string | number;
  username: string;
  email: string;
  password: string;
  phone_number: string;
  address?: string;
  role: string;
  status?: string;
  shop_code?: string;
  last_login?: string;
  previous_last_login?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://android.cloudapp.ind.in/cloth_store';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private router: Router) {}

  // --------------------------
  // FETCH USERS
  // --------------------------
  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/users_list/2020`);
  }

  // --------------------------
  // UPDATE LAST LOGIN
  // --------------------------
  updateLastLogin(user: User): Observable<any> {
    if (!user?.user_id) return of({});

    const previousLogin = user.last_login || this.formatDate(new Date());
    const payload = {
      ...user,
      user_id: Number(user.user_id),
      last_login: this.formatDate(new Date()),
      previous_last_login: previousLogin,
      shop_code: user.shop_code || '2020'
    };

    return this.http.post(`${this.apiUrl}/users/edit_users`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --------------------------
  // LOG LOGIN HISTORY
  // --------------------------
  logLoginHistory(
    user: Partial<User>,
    status: 'success' | 'failure',
    ip?: string,
    userAgent?: string
  ): Observable<any> {
    const payload = {
      user_id: Number(user.user_id) || 0,
      email: user.email || '',
      role: user.role || '',
      status,
      ip_address: ip || '',
      user_agent: userAgent || '',
      login_time: this.formatDate(new Date()),
      shop_code: user.shop_code || '2020'
    };

    console.log('Login history payload:', payload);

    return this.http.post(`${this.apiUrl}/login_history/add_login_history`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --------------------------
  // SAVE USER IN LOCALSTORAGE
  // --------------------------
  saveUser(user: User) {
    if (isPlatformBrowser(this.platformId)) {
      const existingUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (existingUser?.last_login) {
        user.previous_last_login = existingUser.last_login;
      }
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // --------------------------
  // GET CURRENT USER
  // --------------------------
  getUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem('user') || 'null');
    }
    return null;
  }

  // --------------------------
  // LOGOUT
  // --------------------------
  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // --------------------------
  // ROLE & AUTH CHECKS
  // --------------------------
  getRole(): string {
    const user = this.getUser();
    return user?.role || '';
  }

  isAdmin(): boolean {
    return this.getRole().toLowerCase() === 'admin';
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('user');
    }
    return false;
  }

  // --------------------------
  // HELPER: format date to MySQL DATETIME
  // --------------------------
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

}
