import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  user_id: number;
  username: string;
}

interface Inquiry {
  inquiry_id: number;
  message: string;
}

interface InquiryReply {
  reply_id: number;
  inquiry_id: number;
  admin_id: number;
  reply_message: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-inquiry-replies',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './admin-inquiry-replies.html',
  styleUrls: ['./admin-inquiry-replies.scss']
})
export class AdminInquiryReplies implements OnInit {
  replyForm!: FormGroup;
  inquiryReplies: InquiryReply[] = [];
  users: User[] = [];
  inquiries: Inquiry[] = [];
  editMode: boolean = false;
  editReplyId: number | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.loadInquiries();
    this.loadReplies();
  }

  initForm() {
    this.replyForm = this.fb.group({
      inquiry_id: ['', Validators.required],
      admin_id: ['', Validators.required],
      reply_message: ['', Validators.required],
    });
  }

  loadUsers() {
    this.http.get<User[]>('https://android.cloudapp.ind.in/cloth_store/users/users_list/2020')
      .subscribe(res => this.users = res || []);
  }

  loadInquiries() {
    this.http.get<Inquiry[]>('https://android.cloudapp.ind.in/cloth_store/inquiries/inquiries_list/2020')
      .subscribe(res => this.inquiries = res || []);
  }

  loadReplies() {
    this.loading = true;
    this.http.get<InquiryReply[]>('https://android.cloudapp.ind.in/cloth_store/inquiry_replies/inquiry_replies_list/2020')
      .subscribe(res => {
        this.inquiryReplies = res || [];
        this.loading = false;
      }, () => this.loading = false);
  }

  submitForm() {
    if (this.replyForm.invalid) return;

    const payload = { ...this.replyForm.value, shop_code: 2020 };

    if (this.editMode && this.editReplyId) {
      payload['reply_id'] = this.editReplyId;
      this.http.post('https://android.cloudapp.ind.in/cloth_store/inquiry_replies/edit_inquiry_replies', payload)
        .subscribe(() => {
          this.loadReplies();
          this.cancelEdit();
        });
    } else {
      this.http.post('https://android.cloudapp.ind.in/cloth_store/inquiry_replies/add_inquiry_replies', payload)
        .subscribe(() => {
          this.loadReplies();
          this.replyForm.reset();
        });
    }
  }

  editReply(reply: InquiryReply) {
    this.editMode = true;
    this.editReplyId = reply.reply_id;
    this.replyForm.patchValue({
      inquiry_id: reply.inquiry_id,
      admin_id: reply.admin_id,
      reply_message: reply.reply_message,
    });
  }

  deleteReply(reply_id: number) {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    this.http.post('https://android.cloudapp.ind.in/cloth_store/inquiry_replies/delete_inquiry_replies', { reply_id, shop_code: 2020 })
      .subscribe(() => this.loadReplies());
  }

  cancelEdit() {
    this.editMode = false;
    this.editReplyId = null;
    this.replyForm.reset();
  }

  // Methods to safely get related info
  getInquiryMessage(inquiry_id: number): string {
    const inquiry = this.inquiries.find(i => i.inquiry_id === inquiry_id);
    return inquiry ? inquiry.message : '';
  }

  getAdminName(admin_id: number): string {
    const user = this.users.find(u => u.user_id === admin_id);
    return user ? user.username : '';
  }
}