import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-color',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-color.html',
  styleUrl: './admin-color.scss'
})
export class AdminColor implements OnInit {

  colors: any[] = [];
  newColor: any = { color_name: '', hex_code: '' };
  editColorData: any = null;
  apiBase = 'https://android.cloudapp.ind.in/cloth_store/colors';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getColors();
  }

  // ✅ Get all colors
  getColors() {
    this.http.get<any[]>(`${this.apiBase}/colors_list/2020`).subscribe({
      next: (res) => this.colors = res,
      error: (err) => console.error(err)
    });
  }

  // ✅ Add new color
  addColor() {
    const payload = { ...this.newColor, shop_code: '2020' };
    this.http.post(`${this.apiBase}/add_colors`, payload).subscribe({
      next: () => {
        this.newColor = { color_name: '', hex_code: '' };
        this.getColors();
      },
      error: (err) => console.error(err)
    });
  }

  // ✅ Edit existing color
  editColor(color: any) {
    this.editColorData = { ...color };
  }

  updateColor() {
    const payload = { ...this.editColorData, shop_code: '2020' };
    this.http.post(`${this.apiBase}/edit_colors`, payload).subscribe({
      next: () => {
        this.editColorData = null;
        this.getColors();
      },
      error: (err) => console.error(err)
    });
  }

  // ✅ Delete color
  deleteColor(color_id: number) {
    if (!confirm('Are you sure you want to delete this color?')) return;
    this.http.post(`${this.apiBase}/delete_colors`, { color_id, shop_code: '2020' }).subscribe({
      next: () => this.getColors(),
      error: (err) => console.error(err)
    });
  }
}