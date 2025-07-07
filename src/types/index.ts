export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  notes?: string;
  sessionId?: string;
  barcode?: string;
  barcodeGeneratedAt?: string;
  paymentCompletedAt?: string;
  paymentMethod?: string;
  paidAmount?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  availableTables: number;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface StaffCall {
  id: string;
  tableId: string;
  type: 'assistance' | 'payment' | 'cleaning' | 'other';
  message?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface TableQRCode {
  tableId: string;
  qrCodeData: string;
  qrCodeImage: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  sessionToken: string;
  sessionName: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface SessionContextType {
  sessionId: string | null;
  sessionName: string | null;
  sessionCreatedAt: string | null;
  sessionExpiresAt: string | null;
  createSession: (tableId: string) => Promise<string>;
  validateSession: (sessionId: string) => boolean;
  clearSession: () => void;
}