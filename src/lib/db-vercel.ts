import { User, Table, MenuItem, Order, StaffCall, Category } from '@/types';

interface Database {
  users: User[];
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  categories: Category[];
  staffCalls: StaffCall[];
}

let memoryDatabase: Database | null = null;

const getInitialData = (): Database => ({
  users: [
    {
      id: "admin-1",
      name: "Admin User",
      email: "admin@restaurant.com",
      password: "$2b$10$bR7XGbVhMaki.HMp9ssub.6OvL0TudiOqtVqKmTehc7NJ3K2G9ohq",
      role: "admin",
      createdAt: "2025-01-01T00:00:00.000Z"
    }
  ],
  tables: [
    {
      id: "table-1",
      number: 1,
      capacity: 4,
      status: "available",
      qrCode: "QR_TABLE_1"
    },
    {
      id: "table-2",
      number: 2,
      capacity: 2,
      status: "available",
      qrCode: "QR_TABLE_2"
    },
    {
      id: "table-3",
      number: 3,
      capacity: 6,
      status: "available",
      qrCode: "QR_TABLE_3"
    }
  ],
  menuItems: [
    {
      id: "menu-1",
      name: "ハンバーガー",
      description: "ジューシーなビーフパティとフレッシュな野菜",
      price: 1200,
      category: "メイン",
      image: "/uploads/menu/burger.jpg",
      available: true
    },
    {
      id: "menu-2",
      name: "フライドポテト",
      description: "カリカリに揚げたポテト",
      price: 500,
      category: "サイド",
      image: "/uploads/menu/fries.jpg",
      available: true
    },
    {
      id: "menu-3",
      name: "コーラ",
      description: "冷たいコーラ",
      price: 300,
      category: "ドリンク",
      image: "/uploads/menu/cola.jpg",
      available: true
    }
  ],
  orders: [],
  categories: [
    {
      id: "cat-1",
      name: "メイン",
      displayOrder: 1,
      active: true
    },
    {
      id: "cat-2",
      name: "サイド",
      displayOrder: 2,
      active: true
    },
    {
      id: "cat-3",
      name: "ドリンク",
      displayOrder: 3,
      active: true
    },
    {
      id: "cat-4",
      name: "デザート",
      displayOrder: 4,
      active: true
    }
  ],
  staffCalls: []
});

export function readDatabase(): Database {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (!memoryDatabase) {
      memoryDatabase = getInitialData();
    }
    return memoryDatabase;
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'src/data/db.json');
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Database file not found, using initial data');
    return getInitialData();
  }
}

export function writeDatabase(data: Database): void {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    memoryDatabase = data;
    return;
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'src/data/db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write database:', error);
  }
}

export function getUsers(): User[] {
  const db = readDatabase();
  return db.users;
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.email === email);
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.id === id);
}

export function createUser(user: User): void {
  const db = readDatabase();
  db.users.push(user);
  writeDatabase(db);
}

export function getTables(): Table[] {
  const db = readDatabase();
  return db.tables;
}

export function getTableById(id: string): Table | undefined {
  const tables = getTables();
  return tables.find(table => table.id === id);
}

export function createTable(table: Table): void {
  const db = readDatabase();
  db.tables.push(table);
  writeDatabase(db);
}

export function updateTable(id: string, updates: Partial<Table>): void {
  const db = readDatabase();
  const index = db.tables.findIndex(table => table.id === id);
  if (index !== -1) {
    db.tables[index] = { ...db.tables[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteTable(id: string): void {
  const db = readDatabase();
  db.tables = db.tables.filter(table => table.id !== id);
  writeDatabase(db);
}

export function getMenuItems(): MenuItem[] {
  const db = readDatabase();
  return db.menuItems;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  const menuItems = getMenuItems();
  return menuItems.find(item => item.id === id);
}

export function createMenuItem(item: MenuItem): void {
  const db = readDatabase();
  db.menuItems.push(item);
  writeDatabase(db);
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): void {
  const db = readDatabase();
  const index = db.menuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    db.menuItems[index] = { ...db.menuItems[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteMenuItem(id: string): void {
  const db = readDatabase();
  db.menuItems = db.menuItems.filter(item => item.id !== id);
  writeDatabase(db);
}

export function getOrders(): Order[] {
  const db = readDatabase();
  return db.orders;
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(order => order.id === id);
}

export function getOrdersByTableId(tableId: string): Order[] {
  const orders = getOrders();
  return orders.filter(order => order.tableId === tableId);
}

export function getOrdersBySessionId(sessionId: string): Order[] {
  const orders = getOrders();
  return orders.filter(order => order.sessionId === sessionId);
}

export function createOrder(order: Order): void {
  const db = readDatabase();
  db.orders.push(order);
  writeDatabase(db);
}

export function updateOrder(id: string, updates: Partial<Order>): void {
  const db = readDatabase();
  const index = db.orders.findIndex(order => order.id === id);
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteOrder(id: string): void {
  const db = readDatabase();
  db.orders = db.orders.filter(order => order.id !== id);
  writeDatabase(db);
}

export function getCategories(): Category[] {
  const db = readDatabase();
  return db.categories;
}

export function getCategoryById(id: string): Category | undefined {
  const categories = getCategories();
  return categories.find(category => category.id === id);
}

export function createCategory(category: Category): void {
  const db = readDatabase();
  db.categories.push(category);
  writeDatabase(db);
}

export function updateCategory(id: string, updates: Partial<Category>): void {
  const db = readDatabase();
  const index = db.categories.findIndex(category => category.id === id);
  if (index !== -1) {
    db.categories[index] = { ...db.categories[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteCategory(id: string): void {
  const db = readDatabase();
  db.categories = db.categories.filter(category => category.id !== id);
  writeDatabase(db);
}

export function getStaffCalls(): StaffCall[] {
  const db = readDatabase();
  return db.staffCalls;
}

export function getStaffCallById(id: string): StaffCall | undefined {
  const staffCalls = getStaffCalls();
  return staffCalls.find(call => call.id === id);
}

export function createStaffCall(call: StaffCall): void {
  const db = readDatabase();
  db.staffCalls.push(call);
  writeDatabase(db);
}

export function updateStaffCall(id: string, updates: Partial<StaffCall>): void {
  const db = readDatabase();
  const index = db.staffCalls.findIndex(call => call.id === id);
  if (index !== -1) {
    db.staffCalls[index] = { ...db.staffCalls[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteStaffCall(id: string): void {
  const db = readDatabase();
  db.staffCalls = db.staffCalls.filter(call => call.id !== id);
  writeDatabase(db);
}
