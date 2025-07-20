export type Zone = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type ScannedArticle = {
  id: string;
  ean: string;
  scannedAt: string;
  zoneId: string;
  zoneName: string; // denormalized for easy display
  userId: string;
  countNumber: number;
};

// In-memory 'database'
let zones: Zone[] = [
  { id: 'zone-1', name: 'Warehouse A', description: 'Main storage area for dry goods.', createdAt: new Date().toISOString() },
  { id: 'zone-2', name: 'Cold Storage 1', description: 'Refrigerated section for perishable items.', createdAt: new Date().toISOString() },
  { id: 'zone-3', name: 'Receiving Dock', description: 'Area for incoming shipments.', createdAt: new Date().toISOString() },
  { id: 'zone-4', name: 'Shipping Bay', description: 'Area for outgoing orders.', createdAt: new Date().toISOString() },
];

let scannedArticles: ScannedArticle[] = [
  { id: 'scan-1', ean: '8412345678901', scannedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-01', countNumber: 1 },
  { id: 'scan-2', ean: '8412345678902', scannedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-02', countNumber: 1 },
  { id: 'scan-3', ean: '8412345678903', scannedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), zoneId: 'zone-1', zoneName: 'Warehouse A', userId: 'user-01', countNumber: 2 },
  { id: 'scan-4', ean: '8412345678904', scannedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), zoneId: 'zone-2', zoneName: 'Cold Storage 1', userId: 'user-03', countNumber: 1 },
  { id: 'scan-5', ean: '8412345678905', scannedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), zoneId: 'zone-4', zoneName: 'Shipping Bay', userId: 'user-02', countNumber: 3 },
  { id: 'scan-6', ean: '8412345678906', scannedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), zoneId: 'zone-3', zoneName: 'Receiving Dock', userId: 'user-01', countNumber: 1 },
];

// Data access functions
export const getDbZones = () => zones;
export const getDbScannedArticles = () => scannedArticles;

export const setDbZones = (newZones: Zone[]) => {
  zones = newZones;
};
export const setDbScannedArticles = (newArticles: ScannedArticle[]) => {
  scannedArticles = newArticles;
};
