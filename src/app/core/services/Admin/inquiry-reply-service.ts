// src/app/services/inquiry-reply.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InquiryReply {
  reply_id: number;
  inquiry_id: number;
  admin_id: number;
  reply_message: string;
  created_at: string; // Assuming ISO date string
}

export interface User {
  user_id: number;
  // Add other user fields as needed
}

export interface Inquiry {
  inquiry_id: number;
  // Add other inquiry fields as needed, e.g., inquiry_message, user_id, etc.
}
@Injectable({
  providedIn: 'root'
})
export class InquiryReplyService {
private baseUrl = 'https://android.cloudapp.ind.in/cloth_store';
  private shopCode = '2020'; // Assuming shop code is fixed or retrieved from auth

  constructor(private http: HttpClient) {}

  // Fetch list of inquiry replies (assuming GET with shop_code param if needed)
  getInquiryReplies(): Observable<InquiryReply[]> {
    let params = new HttpParams().set('shop_code', this.shopCode);
    return this.http.get<InquiryReply[]>(`${this.baseUrl}/inquiry_replies/inquiry_replies_list`, { params });
  }

  // Add a new inquiry reply (assuming POST with body)
  addInquiryReply(reply: Partial<InquiryReply>): Observable<any> {
    const body = { ...reply, shop_code: this.shopCode };
    return this.http.post(`${this.baseUrl}/inquiry_replies/add_inquiry_replies`, body);
  }

  // Edit an existing inquiry reply (assuming POST or PUT with body including reply_id)
  editInquiryReply(reply: InquiryReply): Observable<any> {
    const body = { ...reply, shop_code: this.shopCode };
    return this.http.post(`${this.baseUrl}/inquiry_replies/edit_inquiry_replies`, body); // Or use put if applicable
  }

  // Delete an inquiry reply (assuming POST or DELETE with reply_id)
  deleteInquiryReply(reply_id: number): Observable<any> {
    const body = { reply_id, shop_code: this.shopCode };
    return this.http.post(`${this.baseUrl}/inquiry_replies/delete_inquiry_replies`, body); // Or use delete if applicable
  }

  // Fetch users (for admin_id reference, assuming GET)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/users_list/${this.shopCode}`);
  }

  // Fetch inquiries (for inquiry_id dropdown)
  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.baseUrl}/inquiries/inquiries_list/${this.shopCode}`);
  }

  // Assuming a method to get current logged-in user_id (mock or from auth service)
  getCurrentAdminId(): number {
    // Replace with actual auth logic, e.g., from localStorage or auth service
    return 1; // Mock value
  }
}

