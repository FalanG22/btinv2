

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
}

export type Zone = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  companyId: string;
};

export type Product = {
  code: string; // EAN or Serial
  sku: string;
  description: string;
};

export type ScannedArticle = {
  id: string;
  ean: string; // Also used for serial number
  sku: string;
  description: string;
  scannedAt: string;
  zoneId: string;
  zoneName: string; // denormalized for easy display
  userId: string;
  countNumber: number;
  isSerial?: boolean; // To distinguish between EAN and Serial
  companyId: string;
};

// In-memory 'database'

let companies: Company[] = [
    { id: 'company-1', name: 'LogiCore Solutions' },
    { id: 'company-2', name: 'SwiftHaul Logistics' },
];

let users: User[] = [
    { id: 'user-admin', name: 'Admin User', email: 'admin@logicore.com', role: 'admin', companyId: 'company-1', createdAt: new Date().toISOString() },
    { id: 'user-1', name: 'Alice Smith', email: 'alice@logicore.com', role: 'user', companyId: 'company-1', createdAt: new Date().toISOString() },
    { id: 'user-2', name: 'Bob Johnson', email: 'bob@swifthaul.com', role: 'user', companyId: 'company-2', createdAt: new Date().toISOString() },
];

// Master Product List
const dbProducts: Product[] = [
  { code: '8412345678901', sku: 'SKU-001', description: 'Caja de Tornillos 5mm' },
  { code: '8412345678902', sku: 'SKU-002', description: 'Paquete de Pilas AA' },
  { code: 'SN-ABC-001', sku: 'SKU-LAP-01', description: 'Laptop Modelo X' },
  { code: '8412345678904', sku: 'SKU-004', description: 'Agua Mineral 1L' },
  { code: 'SN-DEF-002', sku: 'SKU-MON-02', description: 'Monitor 24 pulgadas' },
  { code: 'SN-GHI-003', sku: 'SKU-CAM-03', description: 'Cámara de Seguridad' },
];


let zones: Zone[] = [
  { id: 'zone-1', name: 'Warehouse A', description: 'Main storage area for dry goods.', createdAt: new Date().toISOString(), companyId: 'company-1' },
  { id: 'zone-2', name: 'Cold Storage 1', description: 'Refrigerated section for perishable items.', createdAt: new Date().toISOString(), companyId: 'company-1' },
  { id: 'zone-3', name: 'Receiving Dock', description: 'Area for incoming shipments.', createdAt: new Date().toISOString(), companyId: 'company-2' },
  { id: 'zone-4', name: 'Shipping Bay', description: 'Area for outgoing orders.', createdAt: new Date().toISOString(), companyId: 'company-2' },
];

let scannedArticles: ScannedArticle[] = [
  { id: 'scan-1', ean: '8412345678901', sku: 'SKU-001', description: 'Caja de Tornillos 5mm', scannedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-1' },
  { id: 'scan-2', ean: '8412345678902', sku: 'SKU-002', description: 'Paquete de Pilas AA', scannedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-1' },
  { id: 'scan-3', ean: 'SN-ABC-001', sku: 'SKU-LAP-01', description: 'Laptop Modelo X', scannedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-2', countNumber: 1, isSerial: true, companyId: 'company-2' },
  { id: 'scan-4', ean: '8412345678904', sku: 'SKU-004', description: 'Agua Mineral 1L', scannedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), zoneId: 'zone-2', zoneName: 'Cold Storage 1', userId: 'user-1', countNumber: 1, isSerial: false, companyId: 'company-1' },
  { id: 'scan-5', ean: 'SN-DEF-002', sku: 'SKU-MON-02', description: 'Monitor 24 pulgadas', scannedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-2', countNumber: 2, isSerial: true, companyId: 'company-2' },
  { id: 'scan-6', ean: 'SN-GHI-003', sku: 'SKU-CAM-03', description: 'Cámara de Seguridad', scannedAt: new Date().toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-1', countNumber: 1, isSerial: true, companyId: 'company-1' },
];

// Data access functions
export const getDbCompanies = () => companies;
export const getDbUsers = () => users;
export const getDbProducts = () => dbProducts;
export const getDbZones = () => zones;
export const getDbScannedArticles = () => scannedArticles;


export const setDbUsers = (newUsers: User[]) => {
    users = newUsers;
};
export const setDbZones = (newZones: Zone[]) => {
  zones = newZones;
};
export const setDbScannedArticles = (newArticles: ScannedArticle[]) => {
  scannedArticles = newArticles;
};
