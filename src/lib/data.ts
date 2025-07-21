// This file now only contains type definitions for our data structures.
// All data fetching is handled by src/lib/actions.ts using the database connection from src/lib/db.ts.

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
