import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CategoryService, Category } from '../../../core/services/Admin/category.service';

@Component({
  selector: 'app-admin-category',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-category.html',
  styleUrl: './admin-category.scss'
})
export class AdminCategory  {
// Signals for reactive state
  categories = signal<Category[]>([]);
  parentCategories = computed(() =>
    this.categories().filter(c => !c.parent_id || c.parent_id === 0)
  );
  newCategory = signal<Category>({ name: '', description: '', parent_id: null, shop_code: '2020' });
  editingCategory = signal<Category | null>(null);
  errorMsg = signal<string>('');

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data ?? []);
        console.log('Loaded categories:', data);
      },
      error: (err) => {
        console.error('Error fetching categories', err);
        this.errorMsg.set('Failed to load categories');
      }
    });
  }

  // Get category name by category_id (replaces findCategory pipe)
  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) return 'None';
    return this.categories().find(c => c.category_id === categoryId)?.name ?? 'Unknown';
  }

  // Get available parent categories, excluding the current category for edit mode
  availableParentCategories(categoryId: number | undefined): Category[] {
    return this.parentCategories().filter(c => c.category_id !== categoryId);
  }

  addCategory(): void {
    const category = this.newCategory();
    if (!category.name) {
      this.errorMsg.set('Category name is required');
      return;
    }
    this.categoryService.addCategory(category).subscribe({
      next: () => {
        this.loadCategories();
        this.newCategory.set({ name: '', description: '', parent_id: null, shop_code: '2020' });
        this.errorMsg.set('');
      },
      error: (err) => {
        console.error('Error adding category', err);
        this.errorMsg.set('Failed to add category');
      }
    });
  }

  startEdit(cat: Category): void {
    this.editingCategory.set({ ...cat, shop_code: '2020' });
    this.errorMsg.set('');
    console.log('Editing category:', cat);
  }

  saveEdit(): void {
    const category = this.editingCategory();
    if (!category || !category.name) {
      this.errorMsg.set('Category name is required');
      return;
    }
    if (!category.category_id) {
      this.errorMsg.set('Category ID is missing');
      return;
    }
    this.categoryService.editCategory(category).subscribe({
      next: () => {
        this.loadCategories();
        this.editingCategory.set(null);
        this.errorMsg.set('');
      },
      error: (err) => {
        console.error('Error editing category', err);
        this.errorMsg.set('Failed to save category');
      }
    });
  }

  cancelEdit(): void {
    this.editingCategory.set(null);
    this.errorMsg.set('');
  }

  deleteCategory(category_id: number | undefined): void {
    if (!category_id) {
      this.errorMsg.set('Category ID is missing');
      return;
    }
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(category_id).subscribe({
        next: () => {
          this.loadCategories();
          this.errorMsg.set('');
        },
        error: (err) => {
          console.error('Error deleting category', err);
          this.errorMsg.set('Failed to delete category');
        }
      });
    }
  }

  // Update methods for newCategory signal
  updateNewCategoryName(name: string): void {
    this.newCategory.update(c => ({ ...c, name }));
  }

  updateNewCategoryDescription(description: string): void {
    this.newCategory.update(c => ({ ...c, description }));
  }

  updateNewCategoryParentId(parent_id: number | null): void {
    this.newCategory.update(c => ({ ...c, parent_id }));
  }

  // Update methods for editingCategory signal
  updateEditingCategoryName(name: string): void {
    this.editingCategory.update(c => c ? { ...c, name } : null);
  }

  updateEditingCategoryDescription(description: string): void {
    this.editingCategory.update(c => c ? { ...c, description } : null);
  }

  updateEditingCategoryParentId(parent_id: number | null): void {
    this.editingCategory.update(c => c ? { ...c, parent_id } : null);
  }
}