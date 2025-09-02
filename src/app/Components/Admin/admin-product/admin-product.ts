import { Component, signal, computed, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, Product } from '../../../core/services/Admin/product.service';
import { CategoryService, Category } from '../../../core/services/Admin/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-product',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-product.html',
  styleUrls: ['./admin-product.scss']
})
export class AdminProduct {
  // Signals for reactive state
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  parentCategories = computed(() => this.categories().filter(c => !c.parent_id || c.parent_id === 0));
  subCategories = signal<Category[]>([]);
  selectedParentCategoryId = signal<number | null>(null);
  newProduct = signal<Product>({
    name: '',
    description: '',
    category_id: 0,
    image_url: ''
  });
  editingProduct = signal<Product | null>(null);
  editingParentCategoryId = signal<number | null>(null);
  editingSubCategories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    // Effect to update subCategories when selectedParentCategoryId changes
    effect(() => {
      const parentId = this.selectedParentCategoryId();
      this.subCategories.set(parentId
        ? this.categories().filter(c => c.parent_id === parentId)
        : []
      );
      // Reset category_id if parent changes
      if (parentId) {
        this.newProduct.update(p => ({ ...p, category_id: 0 }));
      }
    });

    // Effect to update editingSubCategories when editingParentCategoryId changes
    effect(() => {
      const parentId = this.editingParentCategoryId();
      this.editingSubCategories.set(parentId
        ? this.categories().filter(c => c.parent_id === parentId)
        : []
      );
      if (parentId && this.editingProduct()) {
        this.editingProduct.update(p => p ? { ...p, category_id: 0 } : null);
      }
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats ?? []),
      error: () => {
        this.categories.set([]);
        this.errorMsg.set('Failed to load categories');
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data ?? []),
      error: () => this.errorMsg.set('Failed to load products'),
      complete: () => this.loading.set(false)
    });
  }

  // Get category name by category_id
  getCategoryName(categoryId: number): string {
    return this.categories().find(c => c.category_id === categoryId)?.name ?? 'Unknown';
  }

  // Methods to update newProduct signal
  updateNewProductName(name: string): void {
    this.newProduct.update(p => ({ ...p, name }));
  }

  updateNewProductDescription(description: string): void {
    this.newProduct.update(p => ({ ...p, description }));
  }

  updateNewProductImageUrl(image_url: string): void {
    this.newProduct.update(p => ({ ...p, image_url }));
  }

  updateNewProductCategoryId(category_id: number): void {
    this.newProduct.update(p => ({ ...p, category_id }));
  }

  // Methods to update editingProduct signal
  updateEditingProductName(name: string): void {
    this.editingProduct.update(p => p ? { ...p, name } : null);
  }

  updateEditingProductDescription(description: string): void {
    this.editingProduct.update(p => p ? { ...p, description } : null);
  }

  updateEditingProductImageUrl(image_url: string): void {
    this.editingProduct.update(p => p ? { ...p, image_url } : null);
  }

  updateEditingProductCategoryId(category_id: number): void {
    this.editingProduct.update(p => p ? { ...p, category_id } : null);
  }

  addProduct(): void {
    const product = this.newProduct();
    if (!product.name || !product.category_id) {
      this.errorMsg.set('Name and subcategory are required');
      return;
    }
    this.productService.addProduct(product).subscribe({
      next: () => {
        this.loadProducts();
        this.newProduct.set({ name: '', description: '', category_id: 0, image_url: '' });
        this.selectedParentCategoryId.set(null);
      },
      error: () => this.errorMsg.set('Failed to add product')
    });
  }

  startEdit(prod: Product): void {
    this.editingProduct.set({ ...prod });
    const selectedCategory = this.categories().find(c => c.category_id === prod.category_id);
    this.editingParentCategoryId.set(selectedCategory?.parent_id ?? null);
  }

  saveEdit(): void {
    const product = this.editingProduct();
    if (!product || !product.name || !product.category_id) {
      this.errorMsg.set('Name and subcategory are required');
      return;
    }
    this.productService.editProduct(product).subscribe({
      next: () => {
        this.loadProducts();
        this.editingProduct.set(null);
        this.editingParentCategoryId.set(null);
      },
      error: () => this.errorMsg.set('Failed to save product')
    });
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
    this.editingParentCategoryId.set(null);
  }

  deleteProduct(product_id: number | undefined): void {
    if (!product_id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(product_id).subscribe({
        next: () => this.loadProducts(),
        error: () => this.errorMsg.set('Failed to delete product')
      });
    }
  }
}