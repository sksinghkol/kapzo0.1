// core/services/Admin/category.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  category_id?: number;
  parent_id?: number | null;
  name: string;
  description: string;
  shop_code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
private baseUrl = 'https://android.cloudapp.ind.in/cloth_store/categories';
  categories = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories_list/2020`);
  }

  refreshCategories(): void {
    this.getCategories().subscribe({
      next: (data) => this.categories.set(data ?? []),
      error: (err) => console.error('Error refreshing categories', err)
    });
  }

  addCategory(category: Category): Observable<any> {
    return this.http.post(`${this.baseUrl}/add_categories`, {
      ...category,
      shop_code: '2020'
    });
  }

  editCategory(category: Category): Observable<any> {
    return this.http.post(`${this.baseUrl}/edit_categories`, {
      ...category,
      shop_code: '2020'
    });
  }

  deleteCategory(category_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete_categories`, {
      category_id,
      shop_code: '2020'
    });
  }
}
