CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('admin', 'user') NOT NULL,
  companyId VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS zones (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  companyId VARCHAR(255) NOT NULL,
  UNIQUE(name, companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  code VARCHAR(255) PRIMARY KEY,
  sku VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scannedArticles (
  id VARCHAR(255) PRIMARY KEY,
  ean VARCHAR(255) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  description TEXT,
  scannedAt DATETIME NOT NULL,
  zoneId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  countNumber INT NOT NULL,
  isSerial BOOLEAN DEFAULT FALSE,
  companyId VARCHAR(255) NOT NULL,
  INDEX (ean),
  INDEX (companyId),
  FOREIGN KEY (zoneId) REFERENCES zones(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Seed Data --

INSERT INTO companies (id, name) VALUES
('company-sc', 'SommierCenter SC'),
('company-bt', 'Bedtime BT')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO users (id, name, email, role, companyId, createdAt, password) VALUES
('user-admin', 'Admin SC', 'admin@sommiercenter.com', 'admin', 'company-sc', '2025-07-20 19:00:47', 'password123'),
('user-1', 'Alice Smith', 'alice@sommiercenter.com', 'user', 'company-sc', '2025-07-20 19:00:47', 'password123'),
('user-2', 'Bob Johnson', 'bob@bedtime.com', 'user', 'company-bt', '2025-07-20 19:00:47', 'password123'),
('user-admin-bt', 'Admin BT', 'admin@bedtime.com', 'admin', 'company-bt', '2025-07-20 19:00:47', 'password123')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role), companyId=VALUES(companyId), password=VALUES(password);

INSERT INTO zones (id, name, description, createdAt, companyId) VALUES
('zone-1', 'SC Warehouse A', 'Main storage area for dry goods.', '2025-07-20 19:00:47', 'company-sc'),
('zone-2', 'SC Cold Storage 1', 'Refrigerated section for perishable items.', '2025-07-20 19:00:47', 'company-sc'),
('zone-3', 'BT Receiving Dock', 'Area for incoming shipments.', '2025-07-20 19:00:47', 'company-bt'),
('zone-4', 'BT Shipping Bay', 'Area for outgoing orders.', '2025-07-20 19:00:47', 'company-bt')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

INSERT INTO products (code, sku, description) VALUES
('8412345678901', 'SKU-001', 'Caja de Tornillos 5mm'),
('8412345678902', 'SKU-002', 'Paquete de Pilas AA'),
('SN-ABC-001', 'SKU-LAP-01', 'Laptop Modelo X'),
('8412345678904', 'SKU-004', 'Agua Mineral 1L'),
('SN-DEF-002', 'SKU-MON-02', 'Monitor 24 pulgadas'),
('SN-GHI-003', 'SKU-CAM-03', 'Cámara de Seguridad'),
('7796448205154', 'SKU-COL-01', 'Colchón Bedtime'),
('7796448054691', 'SKU-COL-02', 'Almohada Bedtime')
ON DUPLICATE KEY UPDATE sku=VALUES(sku), description=VALUES(description);

INSERT INTO scannedArticles (id, ean, sku, description, scannedAt, zoneId, userId, countNumber, isSerial, companyId) VALUES
('scan-1', '8412345678901', 'SKU-001', 'Caja de Tornillos 5mm', '2025-07-20 18:58:47', 'zone-1', 'user-1', 1, FALSE, 'company-sc'),
('scan-2', '8412345678902', 'SKU-002', 'Paquete de Pilas AA', '2025-07-20 18:55:47', 'zone-1', 'user-1', 1, FALSE, 'company-sc'),
('scan-3', 'SN-ABC-001', 'SKU-LAP-01', 'Laptop Modelo X', '2025-07-20 18:52:47', 'zone-3', 'user-2', 1, TRUE, 'company-bt'),
('scan-4', '8412345678904', 'SKU-004', 'Agua Mineral 1L', '2025-07-20 18:45:47', 'zone-2', 'user-1', 1, FALSE, 'company-sc'),
('scan-5', 'SN-DEF-002', 'SKU-MON-02', 'Monitor 24 pulgadas', '2025-07-20 18:42:47', 'zone-3', 'user-2', 2, TRUE, 'company-bt'),
('scan-6', 'SN-GHI-003', 'SKU-CAM-03', 'Cámara de Seguridad', '2025-07-20 19:00:47', 'zone-1', 'user-1', 1, TRUE, 'company-sc')
ON DUPLICATE KEY UPDATE ean=VALUES(ean), sku=VALUES(sku);
