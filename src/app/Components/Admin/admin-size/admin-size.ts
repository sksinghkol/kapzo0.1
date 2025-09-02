import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-size',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-size.html',
  styleUrl: './admin-size.scss'
})
export class AdminSize implements OnInit {
  sizes: any[] = [];
  newSize: any = { size_name: '', shop_code: '2020' };
  editSize: any = null;

  private apiUrl = 'https://android.cloudapp.ind.in/cloth_store/sizes';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getSizes();
  }

  // ✅ Get All Sizes
  getSizes() {
    this.http.get<any[]>(`${this.apiUrl}/sizes_list/2020`).subscribe({
      next: (data) => (this.sizes = data),
      error: (err) => console.error('Error fetching sizes', err)
    });
  }

  // ✅ Add Size
  addSize() {
    if (!this.newSize.size_name) return;
    this.http.post(`${this.apiUrl}/add_sizes`, this.newSize).subscribe({
      next: () => {
        this.getSizes();
        this.newSize = { size_name: '', shop_code: '2020' };
      },
      error: (err) => console.error('Error adding size', err)
    });
  }

  // ✅ Enable Edit
  startEdit(size: any) {
    this.editSize = { ...size };
  }

  // ✅ Cancel Edit
  cancelEdit() {
    this.editSize = null;
  }

  // ✅ Update Size
  updateSize() {
    this.http.post(`${this.apiUrl}/edit_sizes`, this.editSize).subscribe({
      next: () => {
        this.getSizes();
        this.editSize = null;
      },
      error: (err) => console.error('Error updating size', err)
    });
  }

  // ✅ Delete Size
  deleteSize(id: number) {
    if (!confirm('Are you sure you want to delete this size?')) return;
    this.http.post(`${this.apiUrl}/delete_sizes`, { size_id: id, shop_code: '2020' }).subscribe({
      next: () => this.getSizes(),
      error: (err) => console.error('Error deleting size', err)
    });
  }
}
