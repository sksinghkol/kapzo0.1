import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Product {
  product_id?: number;
  name: string;
  description: string;
  category_id: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
  shop_code?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
private baseUrl = 'https://android.cloudapp.ind.in/cloth_store/products';

  constructor(private http: HttpClient) {}

  // ✅ LIST (shop_code in path)
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products_list/2020`);
  }

  // ✅ ADD (shop_code in body)
  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.baseUrl}/add_products`, {
      ...product,
      shop_code: '2020'
    });
  }

  // ✅ EDIT (shop_code in body)
  editProduct(product: Product): Observable<any> {
    return this.http.post(`${this.baseUrl}/edit_products`, {
      ...product,
      shop_code: '2020'
    });
  }

  // ✅ DELETE (shop_code in body)
  deleteProduct(product_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete_products`, {
      product_id,
      shop_code: '2020'
    });
  }
}
