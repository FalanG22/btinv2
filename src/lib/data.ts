export type Zone = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
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
};

// In-memory 'database'

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
  { id: 'zone-1', name: 'Warehouse A', description: 'Main storage area for dry goods.', createdAt: new Date().toISOString() },
  { id: 'zone-2', name: 'Cold Storage 1', description: 'Refrigerated section for perishable items.', createdAt: new Date().toISOString() },
  { id: 'zone-3', name: 'Receiving Dock', description: 'Area for incoming shipments.', createdAt: new Date().toISOString() },
  { id: 'zone-4', name: 'Shipping Bay', description: 'Area for outgoing orders.', createdAt: new Date().toISOString() },
];

let scannedArticles: ScannedArticle[] = [
  { id: 'scan-1', ean: '8412345678901', sku: 'SKU-001', description: 'Caja de Tornillos 5mm', scannedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-01', countNumber: 1, isSerial: false },
  { id: 'scan-2', ean: '8412345678902', sku: 'SKU-002', description: 'Paquete de Pilas AA', scannedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-02', countNumber: 1, isSerial: false },
  { id: 'scan-3', ean: 'SN-ABC-001', sku: 'SKU-LAP-01', description: 'Laptop Modelo X', scannedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-01', countNumber: 1, isSerial: true },
  { id: 'scan-4', ean: '8412345678904', sku: 'SKU-004', description: 'Agua Mineral 1L', scannedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), zoneId: 'zone-2', zoneName: 'Cold Storage 1', userId: 'user-03', countNumber: 1, isSerial: false },
  { id: 'scan-5', ean: 'SN-DEF-002', sku: 'SKU-MON-02', description: 'Monitor 24 pulgadas', scannedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-02', countNumber: 2, isSerial: true },
  { id: 'scan-6', ean: 'SN-GHI-003', sku: 'SKU-CAM-03', description: 'Cámara de Seguridad', scannedAt: new Date().toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-01', countNumber: 1, isSerial: true },
];

// Data access functions
export const getDbProducts = () => dbProducts;
export const getDbZones = () => zones;
export const getDbScannedArticles = () => scannedArticles;

export const setDbZones = (newZones: Zone[]) => {
  zones = newZones;
};
export const setDbScannedArticles = (newArticles: ScannedArticle[]) => {
  scannedArticles = newArticles;
};
