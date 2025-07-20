-- Tabla para las empresas.
-- Cada usuario y zona pertenece a una empresa.
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los usuarios.
-- La contraseña se almacena como un hash seguro (ej. con bcrypt).
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    company_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Tabla para las zonas logísticas.
-- El nombre de la zona debe ser único dentro de una misma empresa.
CREATE TABLE zones (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE KEY (name, company_id)
);

-- Tabla maestra de productos.
-- Contiene la información de cada producto (EAN/Serie -> SKU/Descripción).
-- Esto evita repetir la descripción en cada escaneo.
CREATE TABLE products (
    code VARCHAR(255) PRIMARY KEY, -- EAN o Número de Serie
    sku VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    INDEX (sku) -- Índice en SKU para búsquedas rápidas.
);

-- Tabla principal para registrar cada escaneo.
-- Esta será la tabla más grande y con más inserciones.
CREATE TABLE scanned_articles (
    id VARCHAR(36) PRIMARY KEY,
    ean VARCHAR(255) NOT NULL, -- También se usa para el número de serie.
    scanned_at DATETIME NOT NULL,
    zone_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    count_number INT NOT NULL,
    is_serial BOOLEAN NOT NULL DEFAULT FALSE,
    company_id VARCHAR(36) NOT NULL,
    
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    -- Opcional: clave foránea a la tabla de productos si quieres integridad referencial.
    -- FOREIGN KEY (ean) REFERENCES products(code), 

    INDEX (ean),
    INDEX (zone_id),
    INDEX (company_id)
);

-- Insertar datos iniciales si es necesario.
-- Ejemplo para insertar una empresa y un usuario administrador.
-- NOTA: Usa UUIDs reales y contraseñas hasheadas en producción.

-- INSERT INTO companies (id, name) VALUES ('tu-uuid-para-empresa', 'Mi Empresa');
-- INSERT INTO users (id, name, email, password_hash, role, company_id) VALUES ('tu-uuid-para-admin', 'Admin', 'admin@example.com', 'hash_de_tu_contraseña', 'admin', 'tu-uuid-para-empresa');
