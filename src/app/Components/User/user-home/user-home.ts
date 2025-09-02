
import { Component, OnInit, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface Store {
  store_id: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  store_name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  local_area: string;
  pincode: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

interface DeliveryLocation {
  location_id: number;
  store_id?: number;
  location_name: string;
  description: string;
  is_store_pickup: number;
  created_at: string;
}

interface Product {
  product_id: number;
  name: string;
  description: string;
  category_id: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface ProductImage {
  image_id: number;
  product_id: number;
  variant_id: number;
  image_url: string;
  created_at: string;
}

interface Size {
  size_id: number;
  size_name: string;
}

interface Color {
  color_id: number;
  color_name: string;
  hex_code: string;
}

interface ProductVariant {
  variant_id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  mrp_price: number;
  current_price: number;
  discount_percentage: number;
  stock_quantity: number;
  sku: string;
  created_at: string;
}

interface VariantWithDetails extends ProductVariant {
  size_name: string;
  color_name: string;
  hex_code: string;
}

interface Category {
  category_id: number;
  parent_id: number | null;
  name: string;
  description: string;
}

@Pipe({ name: 'categoryName' })
export class CategoryNamePipe implements PipeTransform {
  transform(categoryId: number, categories: Category[]): string {
    const category = categories.find(c => c.category_id === categoryId);
    return category ? category.name : 'Unknown';
  }
}

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, CategoryNamePipe],
  templateUrl: './user-home.html',
  styleUrls: ['./user-home.scss']
})
export class UserHome implements OnInit {
  stores: Store[] = [];
  deliveryLocations: DeliveryLocation[] = [];
  products: Product[] = [];
  productImages: ProductImage[] = [];
  sizes: Size[] = [];
  colors: Color[] = [];
  variants: ProductVariant[] = [];
  categories: Category[] = [];
  currentImageIndex: { [key: number]: number } = {};
  cartQuantities: { [key: number]: number } = {};
  zoomImageUrl: string | null = null;
  expandedStoreId: number | null = null;
  expandedLocation: number | null = null;
  expandedProductId: number | null = null;
  selectedVariantId: number | null = null;
  selectedCategoryId: number | null = null;

  loading: boolean = true;
  error: string | null = null;

  private storeApi = 'https://android.cloudapp.ind.in/cloth_store/stores_list/2020';
  private deliveryApi = 'https://android.cloudapp.ind.in/cloth_store/delivery_locations/delivery_locations_list/2020';
  private productApi = 'https://android.cloudapp.ind.in/cloth_store/products/products_list/2020';
  private productImageApi = 'https://android.cloudapp.ind.in/cloth_store/product_images/product_images_list/2020';
  private sizeApi = 'https://android.cloudapp.ind.in/cloth_store/sizes/sizes_list/2020';
  private colorApi = 'https://android.cloudapp.ind.in/cloth_store/colors/colors_list/2020';
  private variantApi = 'https://android.cloudapp.ind.in/cloth_store/product_variants/product_variants_list/2020';
  private categoryApi = 'https://android.cloudapp.ind.in/cloth_store/categories/categories_list/2020';
  private addListApi = 'https://android.cloudapp.ind.in/cloth_store/list/add_list/2020';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategoryId === null) {
      return this.products;
    }
    // Get all subcategories of the selected category
    const relatedCategoryIds = this.getRelatedCategoryIds(this.selectedCategoryId);
    return this.products.filter(product => relatedCategoryIds.includes(product.category_id));
  }

  getRelatedCategoryIds(categoryId: number): number[] {
    const relatedIds = [categoryId];
    const subcategories = this.categories.filter(cat => cat.parent_id === categoryId);
    for (const subcat of subcategories) {
      relatedIds.push(...this.getRelatedCategoryIds(subcat.category_id));
    }
    return relatedIds;
  }

  trackByStore(index: number, store: Store): number {
    return store.store_id;
  }

  trackByLocation(index: number, location: DeliveryLocation): number {
    return location.location_id;
  }

  trackByProduct(index: number, product: Product): number {
    return product.product_id;
  }

  trackByImage(index: number, image: ProductImage): number {
    return image.image_id;
  }

  trackByVariant(index: number, variant: VariantWithDetails): number {
    return variant.variant_id;
  }

  trackByCategory(index: number, category: Category): number {
    return category.category_id;
  }

  toggleStore(storeId: number): void {
    this.expandedStoreId = this.expandedStoreId === storeId ? null : storeId;
    this.cdr.detectChanges();
  }

  toggleLocation(locationId: number): void {
    this.expandedLocation = this.expandedLocation === locationId ? null : locationId;
    this.cdr.detectChanges();
  }

  toggleProductDetails(productId: number): void {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
    this.cdr.detectChanges();
  }

  selectVariant(productId: number, variantId: number): void {
    this.selectedVariantId = variantId;
    this.currentImageIndex[productId] = 0;
    this.cdr.detectChanges();
  }

  setImageIndex(productId: number, index: number): void {
    const images = this.getProductImages(productId, this.selectedVariantId);
    if (index >= 0 && index < images.length) {
      this.currentImageIndex[productId] = index;
      this.cdr.detectChanges();
    }
  }

  nextImage(productId: number): void {
    const images = this.getProductImages(productId, this.selectedVariantId);
    if (images.length <= 1) return;
    this.currentImageIndex[productId] = (this.currentImageIndex[productId] || 0 + 1) % images.length;
    this.cdr.detectChanges();
  }

  prevImage(productId: number): void {
    const images = this.getProductImages(productId, this.selectedVariantId);
    if (images.length <= 1) return;
    this.currentImageIndex[productId] = (this.currentImageIndex[productId] || 0) - 1;
    if (this.currentImageIndex[productId] < 0) {
      this.currentImageIndex[productId] = images.length - 1;
    }
    this.cdr.detectChanges();
  }

  filterProducts(): void {
    this.cdr.detectChanges();
  }

  fetchData(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      stores: this.http.get<Store[]>(this.storeApi),
      deliveryLocations: this.http.get<DeliveryLocation[]>(this.deliveryApi),
      products: this.http.get<Product[]>(this.productApi),
      productImages: this.http.get<ProductImage[]>(this.productImageApi),
      sizes: this.http.get<Size[]>(this.sizeApi),
      colors: this.http.get<Color[]>(this.colorApi),
      variants: this.http.get<ProductVariant[]>(this.variantApi),
      categories: this.http.get<Category[]>(this.categoryApi)
    }).subscribe({
      next: ({ stores, deliveryLocations, products, productImages, sizes, colors, variants, categories }) => {
        this.stores = stores;
        this.deliveryLocations = deliveryLocations;
        this.products = products;
        this.productImages = productImages.filter(img => img.image_url && img.product_id);
        this.sizes = sizes;
        this.colors = colors;
        this.variants = variants;
        this.categories = categories;
        this.products.forEach(product => {
          this.cartQuantities[product.product_id] = 1;
          this.currentImageIndex[product.product_id] = 0;
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.error = '⚠️ Failed to load data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStoreDeliveryLocations(storeId: number): DeliveryLocation[] {
    return this.deliveryLocations.filter(loc => loc.store_id === storeId || !loc.store_id);
  }

  getProductImages(productId: number, variantId: number | null = null): ProductImage[] {
    let images = this.productImages.filter(i => i.product_id === productId && i.image_url);
    if (variantId) {
      const variantImages = images.filter(i => i.variant_id === variantId);
      images = variantImages.length > 0 ? variantImages : images;
    }
    if (images.length === 0) {
      images = [{
        image_id: 0,
        product_id: productId,
        variant_id: variantId || 0,
        image_url: 'https://via.placeholder.com/300x200?text=No+Image',
        created_at: ''
      }];
    }
    return images.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  getVariants(productId: number): ProductVariant[] {
    return this.variants.filter(v => v.product_id === productId);
  }

  hasStock(productId: number): boolean {
    return this.getVariants(productId).some(v => v.stock_quantity > 0);
  }

  getVariantsWithDetails(productId: number): VariantWithDetails[] {
    const productVariants = this.getVariants(productId);
    return productVariants.map(variant => ({
      ...variant,
      size_name: this.getSizeName(variant.size_id),
      color_name: this.getColorName(variant.color_id),
      hex_code: this.getColorHex(variant.color_id)
    })).filter(v => v.size_name !== 'N/A' && v.color_name !== 'N/A');
  }

  getLowestPrice(productId: number): ProductVariant {
    const productVariants = this.getVariants(productId);
    return productVariants.length
      ? productVariants.reduce((prev, curr) => (prev.current_price < curr.current_price ? prev : curr))
      : {
          variant_id: 0,
          product_id: productId,
          size_id: 0,
          color_id: 0,
          mrp_price: 0,
          current_price: 0,
          discount_percentage: 0,
          stock_quantity: 0,
          sku: 'N/A',
          created_at: ''
        };
  }

  getSizeName(sizeId: number): string {
    const size = this.sizes.find(s => s.size_id === sizeId);
    return size ? size.size_name : 'N/A';
  }

  getColorName(colorId: number): string {
    const color = this.colors.find(c => c.color_id === colorId);
    return color ? color.color_name : 'N/A';
  }

getColorHex(colorId: number): string {
  const color = this.colors.find(c => c.color_id === colorId);
  if (!color) return '#cccccc'; // fallback
  return color.hex_code.startsWith('#') ? color.hex_code : '#' + color.hex_code;
}


  maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return 'N/A';
    const visiblePart = phone.slice(0, -4);
    return `${visiblePart}XXXX`;
  }

  addToList(product: Product): void {
    const payload = {
      user_id: 1,
      product_id: product.product_id,
      delivery_type: 'pickup',
      scheduled_time: new Date().toISOString(),
      order_status: 'pending',
      created_at: new Date().toISOString()
    };

    this.http.post(this.addListApi, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => alert(`✅ ${product.name} added to your wishlist!`),
      error: (err) => {
        console.error('Error adding to wishlist:', err);
        alert('⚠️ Failed to add to wishlist.');
      }
    });
  }

  addToCart(product: Product, index: number): void {
    const quantity = this.cartQuantities[product.product_id] || 1;
    if (quantity < 1 || quantity > 5) {
      alert('⚠️ Quantity must be between 1 and 5.');
      return;
    }
    const payload = {
      user_id: 1,
      product_id: product.product_id,
      quantity,
      delivery_type: 'pickup',
      order_status: 'cart',
      created_at: new Date().toISOString()
    };

    this.http.post(this.addListApi, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => alert(`✅ ${product.name} added to cart with quantity ${quantity}!`),
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('⚠️ Failed to add to cart.');
      }
    });
  }

  openImageZoom(imageUrl: string | undefined): void {
    if (imageUrl) {
      this.zoomImageUrl = this.getDriveImageUrl(imageUrl);
      this.cdr.detectChanges();
    } else {
      console.warn('No valid image URL provided for zoom');
      this.zoomImageUrl = null;
      this.cdr.detectChanges();
    }
  }

  closeImageZoom(): void {
    this.zoomImageUrl = null;
    this.cdr.detectChanges();
  }

  getDriveImageUrl(url: string): string {
    if (!url || url.trim() === '') {
      return 'https://via.placeholder.com/300x200?text=No+Image';
    }
    const match = url.match(/\/d\/([^/]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  }

  onImageError(event: Event, id: string): void {
    console.error(`Failed to load image for ${id}:`, (event.target as HTMLImageElement).src);
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
  }
}