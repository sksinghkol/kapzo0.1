// Core interfaces for the application

export interface Address {
  pincode: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  landmark: string;
  addressLine?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  profilePic?: string;
  phone: string;
  address: Address;
  memberSince: string;
  role: 'customer' | 'seller' | 'admin' | 'master_admin';
  status: 'active' | 'inactive' | 'suspended';
  selectedCity?: string;
}

export interface Store {
  storeId: string; // auto-generated or UID
  id?: string;
  ownerId: string; // auth UID of seller
  storeName: string;
  storeSlug?: string; // for friendly URLs
  description?: string;

  contact?: {
    phone?: string;
    email?: string;
  };

  address?: {
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress?: string;
  };

  images?: string[];

  // array of cities/areas the store delivers to (kept for backward compatibility)
  deliveryLocations?: string[];

  categories?: string[];
  dealsIn?: string[]; // e.g. ["Men","Women","Kids"]

  subscription?: {
    plan?: '1_month' | '3_months' | '6_months' | '12_months';
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'warning' | 'expired';
    reminderDays?: number;
  };

  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
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