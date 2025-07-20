
// NOTE: This has been modified to use a file-based store for local production.
// Data will now persist in a `db.json` file.

import fs from 'fs';
import path from 'path';

export type Company = {
  id: string;
  name: string;
}

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    companyId: string;
    createdAt: string;
    password?: string; 
};

export type Zone = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  companyId: string;
};

export type Product = {
  code: string;
  sku: string;
  description: string;
};

export type ScannedArticle = {
  id: string;
  ean: string;
  sku: string;
  description: string;
  scannedAt: string;
  zoneId: string;
  zoneName: string;
  userId: string;
  countNumber: number;
  isSerial?: boolean;
  companyId: string;
};

// --- Default Mock Data ---
const defaultCompanies: Company[] = [
    { id: 'company-sc', name: 'SommierCenter SC' },
    { id: 'company-bt', name: 'Bedtime BT' },
];

const defaultUsers: User[] = [
    { id: 'user-admin', name: 'Admin SC', email: 'admin@sommiercenter.com', role: 'admin', companyId: 'company-sc', createdAt: new Date().toISOString(), password: 'password123' },
    { id: 'user-1', name: 'Alice Smith', email: 'alice@sommiercenter.com', role: 'user', companyId: 'company-sc', createdAt: new Date().toISOString(), password: 'password123' },
    { id: 'user-2', name: 'Bob Johnson', email: 'bob@bedtime.com', role: 'user', companyId: 'company-bt', createdAt: new Date().toISOString(), password: 'password123' },
    { id: 'user-admin-bt', name: 'Admin BT', email: 'admin@bedtime.com', role: 'admin', companyId: 'company-bt', createdAt: new Date().toISOString(), password: 'password123' },
];

const defaultProducts: Product[] = [
  { code: '8412345678901', sku: 'SKU-001', description: 'Caja de Tornillos 5mm' },
  { code: '8412345678902', sku: 'SKU-002', description: 'Paquete de Pilas AA' },
  { code: 'SN-ABC-001', sku: 'SKU-LAP-01', description: 'Laptop Modelo X' },
  { code: '8412345678904', sku: 'SKU-004', description: 'Agua Mineral 1L' },
  { code: 'SN-DEF-002', sku: 'SKU-MON-02', description: 'Monitor 24 pulgadas' },
  { code: 'SN-GHI-003', sku: 'SKU-CAM-03', description: 'Cámara de Seguridad' },
  { code: '7796448205154', sku: 'SKU-COL-01', description: 'Colchón Bedtime' },
  { code: '7796448054691', sku: 'SKU-COL-02', description: 'Almohada Bedtime' },
];

const defaultZones: Zone[] = [
  { id: 'zone-1', name: 'SC Warehouse A', description: 'Main storage area for dry goods.', createdAt: new Date().toISOString(), companyId: 'company-sc' },
  { id: 'zone-2', name: 'SC Cold Storage 1', description: 'Refrigerated section for perishable items.', createdAt: new Date().toISOString(), companyId: 'company-sc' },
  { id: 'zone-3', name: 'BT Receiving Dock', description: 'Area for incoming shipments.', createdAt: new Date().toISOString(), companyId: 'company-bt' },
  { id: 'zone-4', name: 'BT Shipping Bay', description: 'Area for outgoing orders.', createdAt: new Date().toISOString(), companyId: 'company-bt' },
];

const defaultScannedArticles: ScannedArticle[] = [
  { id: 'scan-1', ean: '8412345678901', sku: 'SKU-001', description: 'Caja de Tornillos 5mm', scannedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'SC Warehouse A', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-sc' },
  { id: 'scan-2', ean: '8412345678902', sku: 'SKU-002', description: 'Paquete de Pilas AA', scannedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'SC Warehouse A', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-sc' },
  { id: 'scan-3', ean: 'SN-ABC-001', sku: 'SKU-LAP-01', description: 'Laptop Modelo X', scannedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'BT Receiving Dock', userId: 'user-2', countNumber: 1, isSerial: true, companyId: 'company-bt' },
  { id: 'scan-4', ean: '8412345678904', sku: 'SKU-004', description: 'Agua Mineral 1L', scannedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), zoneId: 'zone-2', zoneName: 'SC Cold Storage 1', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-sc' },
  { id: 'scan-5', ean: 'SN-DEF-002', sku: 'SKU-MON-02', description: 'Monitor 24 pulgadas', scannedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'BT Receiving Dock', userId: 'user-2', countNumber: 2, isSerial: true, companyId: 'company-bt' },
  { id: 'scan-6', ean: 'SN-GHI-003', sku: 'SKU-CAM-03', description: 'Cámara de Seguridad', scannedAt: new Date().toISOString(), zoneId: 'zone-1', zoneName: 'SC Warehouse A', userId: 'user-1', countNumber: 1, isSerial: true, companyId: 'company-sc' },
];


// --- File-based "database" ---
type AppDb = {
  companies: Company[];
  users: User[];
  zones: Zone[];
  products: Product[];
  scannedArticles: ScannedArticle[];
};

const dbPath = path.resolve(process.cwd(), 'db.json');

const defaultDb: AppDb = {
  companies: defaultCompanies,
  users: defaultUsers,
  zones: defaultZones,
  products: defaultProducts,
  scannedArticles: defaultScannedArticles,
};

function readDb(): AppDb {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf-8');
            return JSON.parse(data);
        } else {
            fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
            return defaultDb;
        }
    } catch (error) {
        console.error('Error reading or initializing DB file:', error);
        return defaultDb;
    }
}

function writeDb(db: AppDb) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error writing to DB file:', error);
    }
}


// --- Data Access Functions ---
export const getDbCompanies = (): Company[] => readDb().companies;
export const getDbUsers = (): User[] => readDb().users;
export const getDbProducts = (): Product[] => readDb().products;
export const getDbZones = (): Zone[] => readDb().zones;
export const getDbScannedArticles = (): ScannedArticle[] => readDb().scannedArticles;

export const setDbCompanies = (newCompanies: Company[]) => { 
    const db = readDb();
    db.companies = newCompanies;
    writeDb(db);
};
export const setDbUsers = (newUsers: User[]) => {
    const db = readDb();
    db.users = newUsers;
    writeDb(db);
};
export const setDbProducts = (newProducts: Product[]) => {
    const db = readDb();
    db.products = newProducts;
    writeDb(db);
};
export const setDbZones = (newZones: Zone[]) => {
    const db = readDb();
    db.zones = newZones;
    writeDb(db);
};
export const setDbScannedArticles = (newArticles: ScannedArticle[]) => {
    const db = readDb();
    db.scannedArticles = newArticles;
    writeDb(db);
};
