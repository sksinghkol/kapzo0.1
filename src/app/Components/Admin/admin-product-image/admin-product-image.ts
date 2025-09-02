import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Product {
  product_id: string;
  name: string;
}

interface Variant {
  variant_id: string;
  product_id: string;
  size_id: string;
  color_id: string;
  mrp_price: number;
  current_price: number;
  discount_percentage: number;
  stock_quantity: number;
  sku: string;
}

interface ProductImage {
  image_id?: string;
  product_id: string;
  variant_id: string;
  image_url: string;
  created_at?: string;
}

@Component({
  selector: 'app-admin-product-image',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-product-image.html',
  styleUrl: './admin-product-image.scss'
})
export class AdminProductImage implements OnInit{
  private baseApi = 'https://android.cloudapp.ind.in/cloth_store';
  private shopCode = '2020';

  products: Product[] = [];
  variants: Variant[] = [];
  productImages: ProductImage[] = [];

  newImage: ProductImage = { product_id: '', variant_id: '', image_url: '' };
  editMode = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
    this.loadVariants();
    this.loadImages();
  }

  // Load products
  loadProducts() {
    this.http.get<Product[]>(`${this.baseApi}/products/products_list/${this.shopCode}`)
      .subscribe({ next: data => this.products = data });
  }

  // Load variants
  loadVariants() {
    this.http.get<Variant[]>(`${this.baseApi}/product_variants/product_variants_list/${this.shopCode}`)
      .subscribe({ next: data => this.variants = data });
  }

  // Load product images
  loadImages() {
    this.http.get<ProductImage[]>(`${this.baseApi}/product_images/product_images_list/${this.shopCode}`)
      .subscribe({ next: data => this.productImages = data });
  }

  // Add or update image
  saveImage() {
    if (!this.newImage.product_id || !this.newImage.variant_id || !this.newImage.image_url) {
      alert('Please fill all fields.');
      return;
    }

    const url = this.editMode
      ? `${this.baseApi}/product_images/edit_product_images`
      : `${this.baseApi}/product_images/add_product_images`;

    const payload = { ...this.newImage, shop_code: this.shopCode };

    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        this.loadImages();
        this.resetForm();
        alert(`Image ${this.editMode ? 'updated' : 'added'} successfully`);
      },
      error: err => console.error('Error saving image:', err)
    });
  }

  // Edit existing image
  editImage(img: ProductImage) {
    this.newImage = { ...img };
    this.editMode = true;
  }

  // Delete image
  deleteImage(image_id: string | undefined) {
    if (!image_id) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    this.http.post(`${this.baseApi}/product_images/delete_product_images`, { image_id, shop_code: this.shopCode })
      .subscribe({ next: () => this.loadImages() });
  }

  // Reset form
  resetForm() {
    this.newImage = { product_id: '', variant_id: '', image_url: '' };
    this.editMode = false;
  }

  // Filter variants by selected product
  filteredVariants() {
    return this.variants.filter(v => v.product_id === this.newImage.product_id);
  }
  getVariantSku(variant_id: string): string {
  const variant = this.variants.find(v => v.variant_id === variant_id);
  return variant ? variant.sku : '-';
}

getProductName(product_id: string): string {
  const product = this.products.find(p => p.product_id === product_id);
  return product ? product.name : '-';
}

}