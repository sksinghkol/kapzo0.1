import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VarientService {
private apiUrl = 'https://android.cloudapp.ind.in/cloth_store'; // adjust base URL

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/categories_list`);
  }

  getSubcategories(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subcategories/subcategories_list/${categoryId}`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/products_list`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/add_products`, product);
  }
}
