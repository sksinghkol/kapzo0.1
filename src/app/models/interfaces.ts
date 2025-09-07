// Core interfaces for the application

export interface Address {
  pincode: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  landmark: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  memberSince: string;
  role: 'customer' | 'seller' | 'admin' | 'master_admin';
  status: 'active' | 'inactive' | 'suspended';
  selectedCity?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  address: Address;
  deliveryLocations: string[]; // Array of cities/areas they deliver to
  images: string[];
  rating: number;
  totalOrders: number;
  status: 'active' | 'inactive';
  createdAt: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  specifications?: { [key: string]: string };
}

export interface WatchlistItem {
  id: string;
  productId: string;
  userId: string;
  storeId: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  addedAt: string;
  notes?: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'requested' | 'completed';
}

export interface ServiceRequest {
  id: string;
  userId: string;
  watchlistId: string;
  storeId: string;
  type: 'home_visit' | 'quick_service' | 'shop_visit';
  scheduledTime?: string;
  customerAddress: Address;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  totalAmount?: number;
  purchasedItems?: string[]; // Array of product IDs that were purchased
  rejectedItems?: string[]; // Array of product IDs that were rejected
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  serviceRequestId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveredAt?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  subtotal: number;
}