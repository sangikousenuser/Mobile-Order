import fs from 'fs';
import path from 'path';
import { User, Table, MenuItem, Order, StaffCall, Category } from '@/types';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

interface Database {
  users: User[];
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  categories: Category[];
  staffCalls: StaffCall[];
}

export function readDatabase(): Database {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Database file not found, creating default structure');
    }
    return {
      users: [],
      tables: [],
      menuItems: [],
      orders: [],
      categories: [],
      staffCalls: []
    };
  }
}

export function writeDatabase(data: Database): void {
  try {
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
  const db = readDatabase();
  return db.users.find(user => user.email === email);
}

export function createUser(user: User): void {
  const db = readDatabase();
  db.users.push(user);
  writeDatabase(db);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const db = readDatabase();
  const index = db.users.findIndex(user => user.id === id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updates };
    writeDatabase(db);
  }
}

export function deleteUser(id: string): void {
  const db = readDatabase();
  db.users = db.users.filter(user => user.id !== id);
  writeDatabase(db);
}

export function getTables(): Table[] {
  const db = readDatabase();
  return db.tables;
}

export function getTableById(id: string): Table | undefined {
  const db = readDatabase();
  return db.tables.find(table => table.id === id);
}

export function updateTable(id: string, updates: Partial<Table>): void {
  const db = readDatabase();
  const index = db.tables.findIndex(table => table.id === id);
  if (index !== -1) {
    db.tables[index] = { ...db.tables[index], ...updates };
    writeDatabase(db);
  }
}

export function createTable(table: Table): void {
  const db = readDatabase();
  db.tables.push(table);
  writeDatabase(db);
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
  const db = readDatabase();
  return db.menuItems.find(item => item.id === id);
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
  const db = readDatabase();
  return db.orders.find(order => order.id === id);
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

export function createStaffCall(staffCall: StaffCall): void {
  const db = readDatabase();
  db.staffCalls.push(staffCall);
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

// エイリアス（他のAPIファイルとの互換性のため）
export const readDB = readDatabase;
export const writeDB = writeDatabase;