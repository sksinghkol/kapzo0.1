import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Variant {
  variant_id?: string;
  product_id: string;
  size_id: string;
  color_id: string;
  mrp_price: number;
  current_price: number;
  discount_percentage: number;
  stock_quantity: number;
  sku: string;
  isEditing?: boolean; // track edit state
}

interface Product {
  product_id: string;
  name: string;
}

interface Size {
  size_id: string;
  size_name: string;
}

interface Color {
  color_id: string;
  color_name: string;
}

@Component({
  selector: 'app-admin-product-variant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-product-variant.html',
  styleUrl: './admin-product-variant.scss'
})
export class AdminProductVariant implements OnInit {
  products: Product[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];
  variants: Variant[] = [];

  private shopCode = '2020';
  private baseUrl = 'https://android.cloudapp.ind.in/cloth_store';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
    this.loadColors();
    this.loadSizes();
    this.loadVariants();
  }

  loadProducts() {
    this.http
      .get<Product[]>(`${this.baseUrl}/products/products_list/${this.shopCode}`)
      .subscribe({
        next: (res) => (this.products = res),
        error: (err: HttpErrorResponse) => console.error('Error loading products:', err)
      });
  }

  loadColors() {
    this.http
      .get<Color[]>(`${this.baseUrl}/colors/colors_list/${this.shopCode}`)
      .subscribe({
        next: (res) => (this.colors = res),
        error: (err: HttpErrorResponse) => console.error('Error loading colors:', err)
      });
  }

  loadSizes() {
    this.http
      .get<Size[]>(`${this.baseUrl}/sizes/sizes_list/${this.shopCode}`)
      .subscribe({
        next: (res) => (this.sizes = res),
        error: (err: HttpErrorResponse) => console.error('Error loading sizes:', err)
      });
  }

  loadVariants() {
    this.http
      .get<Variant[]>(`${this.baseUrl}/product_variants/product_variants_list/${this.shopCode}`)
      .subscribe({
        next: (res) => {
          this.variants = res.map(v => ({
            ...v,
            isEditing: false
          }));
          this.variants.forEach((v) => this.calculateDiscount(v));
        },
        error: (err: HttpErrorResponse) => console.error('Error loading variants:', err)
      });
  }

  addRow() {
    this.variants.push({
      product_id: '',
      size_id: '',
      color_id: '',
      mrp_price: 0,
      current_price: 0,
      discount_percentage: 0,
      stock_quantity: 0,
      sku: '',
      isEditing: true // new rows start in edit mode
    });
  }

  editRow(v: Variant) {
    v.isEditing = true;
  }

  cancelEdit(v: Variant) {
    if (!v.variant_id) {
      // if it’s a new unsaved row, remove it
      this.variants = this.variants.filter(x => x !== v);
    } else {
      v.isEditing = false;
      this.loadVariants(); // reload to discard local edits
    }
  }

  confirmDelete(index: number) {
    const variant = this.variants[index];
    if (!confirm('Are you sure you want to delete this variant?')) return;
    this.removeRow(index);
  }

  removeRow(index: number) {
    const variant = this.variants[index];
    if (variant.variant_id) {
      const url = `${this.baseUrl}/product_variants/delete_product_variants`;
      this.http
        .post(url, { variant_id: variant.variant_id, shop_code: this.shopCode })
        .subscribe({
          next: () => {
            this.variants.splice(index, 1);
            alert('Variant deleted successfully');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error deleting variant:', err);
            alert(`Failed to delete variant: ${err.status} - ${err.message}`);
          }
        });
    } else {
      this.variants.splice(index, 1);
    }
  }

  calculateDiscount(v: Variant) {
    if (v.mrp_price > 0 && v.current_price > 0) {
      v.discount_percentage = Math.round(
        ((v.mrp_price - v.current_price) / v.mrp_price) * 100
      );
    } else {
      v.discount_percentage = 0;
    }
  }

  updateVariant(v: Variant) {
    if (!v.product_id || !v.size_id || !v.color_id || !v.sku || v.mrp_price <= 0 || v.current_price <= 0 || v.stock_quantity < 0) {
      alert('Please fill all required fields (Product, Size, Color, SKU, MRP, Current Price, Stock).');
      return;
    }

    const url = v.variant_id
      ? `${this.baseUrl}/product_variants/edit_product_variants`
      : `${this.baseUrl}/product_variants/add_product_variants`;

    const payload = {
      variant_id: v.variant_id,
      product_id: v.product_id,
      size_id: v.size_id,
      color_id: v.color_id,
      mrp_price: v.mrp_price,
      current_price: v.current_price,
      discount_percentage: v.discount_percentage,
      stock_quantity: v.stock_quantity,
      sku: v.sku,
      shop_code: this.shopCode
    };

    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        if (!v.variant_id && res?.variant_id) {
          v.variant_id = res.variant_id;
        }
        v.isEditing = false;
        alert(`Variant ${v.variant_id ? 'updated' : 'saved'} successfully`);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving variant:', err);
        alert(`Failed to save variant: ${err.status} - ${err.message}`);
      }
    });
  }
}
