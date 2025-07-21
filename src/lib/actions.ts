
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { scanSchema, zoneSchema, scanBatchSchema, serialBatchSchema, zoneBuilderSchema, userSchema, productsCsvSchema } from "./schemas";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";
import { query } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { Company, Product, ScannedArticle, User, Zone } from "./data";

// --- Authentication Actions ---

export async function login(
  prevState: { error: string } | undefined,
  formData: FormData,
) {
    // This is now a dummy login that just redirects.
    redirect('/dashboard');
}

export async function logout() {
    // This is now a dummy logout that just redirects.
    redirect('/login');
}


// --- User Actions ---
export async function getUsers(): Promise<User[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const result = await query<User[] & RowDataPacket[]>(
        'SELECT id, name, email, role, companyId, createdAt FROM users WHERE companyId = ?',
        [session.companyId]
    );
    return result;
}

export async function deleteUser(userId: string) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'admin') {
        return { error: "No autorizado." };
    }

    if (userId.startsWith('user-admin')) { // Simplified check for default admins
        return { error: "No se puede eliminar el usuario administrador por defecto." };
    }

    // Security check: ensure admin can only delete users from their own company
    const [userToDelete] = await query<User[] & RowDataPacket[]>(
        'SELECT companyId FROM users WHERE id = ?', [userId]
    );

    if (!userToDelete || userToDelete.companyId !== session.companyId) {
        return { error: "No tienes permiso para eliminar este usuario." };
    }

    await query('DELETE FROM users WHERE id = ?', [userId]);

    revalidatePath("/users");
    return { success: "Usuario eliminado con éxito." };
}

export async function createUser(data: z.infer<typeof userSchema>) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'admin') {
        return { error: "No autorizado." };
    }

    const validatedFields = userSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: "Datos proporcionados no válidos." };
    }
    const { name, email, companyId, role, password } = validatedFields.data;

    const [existingUser] = await query<User[] & RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existingUser) {
        return { error: "Ya existe un usuario con este correo electrónico." };
    }

    const newId = `user-${Date.now()}`;
    const newUser: User = {
        id: newId,
        name,
        email,
        companyId,
        role,
        createdAt: new Date().toISOString(),
        // In a real app, hash the password here. Storing as plain text for demo only.
        password: password || 'password123'
    };

    await query(
        'INSERT INTO users (id, name, email, companyId, role, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newUser.id, newUser.name, newUser.email, newUser.companyId, newUser.role, newUser.password, newUser.createdAt]
    );

    revalidatePath("/users");
    return { success: `Usuario "${name}" creado con éxito.` };
}

export async function updateUser(data: z.infer<typeof userSchema>) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'admin') {
        return { error: "No autorizado." };
    }

    const validatedFields = userSchema.safeParse(data);
    if (!validatedFields.success || !validatedFields.data.id) {
        return { error: "Datos proporcionados no válidos." };
    }
    const { id, name, email, companyId, role, password } = validatedFields.data;

    const [userToUpdate] = await query<User[] & RowDataPacket[]>(
      'SELECT companyId FROM users WHERE id = ?', [id]
    );
    
    if (!userToUpdate || userToUpdate.companyId !== session.companyId) {
        return { error: "No tienes permiso para actualizar este usuario." };
    }

    const [existingEmail] = await query<User[] & RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?', [email, id]
    );
    if (existingEmail) {
        return { error: "Ya existe otro usuario con este correo electrónico." };
    }
    
    if (password) {
        await query(
            'UPDATE users SET name = ?, email = ?, companyId = ?, role = ?, password = ? WHERE id = ?',
            [name, email, companyId, role, password, id]
        );
    } else {
        await query(
            'UPDATE users SET name = ?, email = ?, companyId = ?, role = ? WHERE id = ?',
            [name, email, companyId, role, id]
        );
    }

    revalidatePath("/users");
    return { success: `Usuario "${name}" actualizado con éxito.` };
}

// --- Company Actions ---
export async function getCompanies(): Promise<Company[]> {
    const session = await getCurrentUser();
    if (!session) return [];
    
    return await query<Company[] & RowDataPacket[]>('SELECT * FROM companies');
}


// --- Zone Actions ---
export async function getZones(): Promise<Zone[]> {
    const session = await getCurrentUser();
    if (!session) return [];
    
    const result = await query<Zone[] & RowDataPacket[]>(
        'SELECT * FROM zones WHERE companyId = ? ORDER BY createdAt DESC',
        [session.companyId]
    );
    return result;
}

export async function getZonesForPrint(fromZoneId: string, toZoneId: string): Promise<Zone[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const allZones = await query<Zone[] & RowDataPacket[]>(
        'SELECT * FROM zones WHERE companyId = ? ORDER BY name ASC',
        [session.companyId]
    );

    const fromIndex = allZones.findIndex(z => z.id === fromZoneId);
    const toIndex = allZones.findIndex(z => z.id === toZoneId);

    if (fromIndex === -1 || toIndex === -1) {
        return [];
    }
    
    return allZones.slice(fromIndex, toIndex + 1);
}

export async function addZonesBatch(data: z.infer<typeof zoneBuilderSchema>) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    const validatedFields = zoneBuilderSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: "Datos proporcionados no válidos." };
    }

    const { streetPrefix, streetFrom, streetTo, rackPrefix, rackFrom, rackTo } = validatedFields.data;
    const companyId = session.companyId; 
    
    const newZones: Omit<Zone, 'id' | 'createdAt'>[] = [];
    for (let s = streetFrom; s <= streetTo; s++) {
        for (let r = rackFrom; r <= rackTo; r++) {
            const street = s.toString().padStart(2, '0');
            const rack = r.toString().padStart(2, '0');
            const zoneName = `${streetPrefix}${street}-${rackPrefix}${rack}`;
            newZones.push({
                name: zoneName,
                description: `Zona ubicada en Calle ${street}, Estantería ${rack}`,
                companyId: companyId,
            });
        }
    }
    
    if (newZones.length === 0) return { error: "No hay zonas para crear." };

    // Insert new zones, ignoring duplicates on zone name for the same company
    const values = newZones.map(z => [
        `zone-${Date.now()}-${Math.random()}`, 
        z.name, 
        z.description, 
        new Date(), 
        z.companyId
    ]);

    const result = await query<ResultSetHeader>(
      'INSERT IGNORE INTO zones (id, name, description, createdAt, companyId) VALUES ?',
      [values]
    );

    if (result.affectedRows === 0) {
        return { error: "No hay nuevas zonas para crear. Puede que ya existan." };
    }

    revalidatePath("/zones");
    revalidatePath("/ean");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    return { success: `${result.affectedRows} zonas creadas con éxito.` };
}

export async function updateZone(data: z.infer<typeof zoneSchema>) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };

    const validatedFields = zoneSchema.safeParse(data);
    if (!validatedFields.success || !validatedFields.data.id) {
        return { error: "Datos proporcionados no válidos." };
    }
    const { id, name, description } = validatedFields.data;

    const [zoneToUpdate] = await query<Zone[] & RowDataPacket[]>(
        'SELECT companyId FROM zones WHERE id = ?', [id]
    );

    if (!zoneToUpdate || zoneToUpdate.companyId !== session.companyId) {
        return { error: "No tienes permiso para actualizar esta zona." };
    }

    await query('UPDATE zones SET name = ?, description = ? WHERE id = ?', [name, description, id]);

    revalidatePath("/zones");
    revalidatePath("/ean");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    return { success: `Zona "${name}" actualizada con éxito.` };
}

export async function deleteZone(zoneId: string) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    const [zoneToDelete] = await query<Zone[] & RowDataPacket[]>(
        'SELECT name, companyId FROM zones WHERE id = ?', [zoneId]
    );
    
    if (!zoneToDelete || zoneToDelete.companyId !== session.companyId) {
        return { error: "No tienes permiso para eliminar esta zona." };
    }
    
    await query('DELETE FROM zones WHERE id = ?', [zoneId]);
    
    revalidatePath("/zones");
    revalidatePath("/ean");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    return { success: `Zona "${zoneToDelete.name}" eliminada con éxito.` };
}


// --- Master Product Actions ---
export async function getProducts(): Promise<Product[]> {
    return await query<Product[] & RowDataPacket[]>('SELECT * FROM products');
}

export async function addProductsFromCsv(products: Product[]) {
    const session = await getCurrentUser();
    if (!session) {
        return { error: "No autorizado." };
    }

    const validatedFields = productsCsvSchema.safeParse(products);
    if (!validatedFields.success) {
        return { error: "El formato del CSV no es válido." };
    }
    
    if (products.length === 0) {
      return { success: "No se encontraron artículos para importar." };
    }

    const values = validatedFields.data.map(p => [p.code, p.sku, p.description]);
    const sql = "INSERT INTO products (code, sku, description) VALUES ? ON DUPLICATE KEY UPDATE sku=VALUES(sku), description=VALUES(description)";
    
    const result = await query<ResultSetHeader>(sql, [values]);

    revalidatePath("/articles");
    return { success: `${result.affectedRows} artículos importados o actualizados correctamente.` };
}

export async function validateEan(ean: string): Promise<{ exists: boolean; isSerial: boolean }> {
    const [product] = await query<Product[] & RowDataPacket[]>(
        'SELECT code FROM products WHERE code = ?', [ean]
    );
    const exists = !!product;
  
    let isSerial = true;
    if (exists) {
        const isEan = product.code.startsWith('779') && product.code.length === 13;
        isSerial = !isEan;
    }
  
    return { exists, isSerial };
}

export async function deleteAllProducts() {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    // In a multi-tenant app, you'd add a companyId to products. Here we clear all.
    await query('DELETE FROM products');

    revalidatePath("/articles");
    revalidatePath("/ean");
    revalidatePath("/serials");
    return { success: "Todos los artículos del maestro han sido eliminados." };
}


// --- Article Scan Actions ---
export async function getScannedArticles(): Promise<ScannedArticle[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const sql = `
        SELECT sa.*, z.name as zoneName 
        FROM scannedArticles sa
        LEFT JOIN zones z ON sa.zoneId = z.id
        WHERE sa.companyId = ?
        ORDER BY sa.scannedAt DESC
    `;
    const articles = await query<ScannedArticle[] & RowDataPacket[]>(sql, [session.companyId]);
    return articles;
}

export async function addScansBatch(scans: z.infer<typeof scanBatchSchema>) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    const validatedFields = scanBatchSchema.safeParse(scans);
    if (!validatedFields.success || validatedFields.data.length === 0) {
        return { error: "Datos de lote no válidos." };
    }
    
    const companyId = session.companyId; 
    const userId = session.id;

    const eanList = validatedFields.data.map(s => s.ean);
    const productsInDb = await query<Product[] & RowDataPacket[]>(
      'SELECT code, sku, description FROM products WHERE code IN (?)', [eanList]
    );
    const productMap = new Map(productsInDb.map(p => [p.code, p]));
    
    const values = validatedFields.data.map((scan, index) => {
        const productInfo = productMap.get(scan.ean);
        return [
            `scan-batch-${Date.now()}-${index}`,
            scan.ean,
            productInfo?.sku || 'N/A',
            productInfo?.description || 'Producto no encontrado',
            scan.scannedAt,
            scan.zoneId,
            userId,
            scan.countNumber,
            false, // isSerial
            companyId
        ];
    });

    if (values.length === 0) return { success: "No hay nuevos escaneos para agregar." };

    await query(
        'INSERT INTO scannedArticles (id, ean, sku, description, scannedAt, zoneId, userId, countNumber, isSerial, companyId) VALUES ?',
        [values]
    );

    revalidatePath("/ean");
    revalidatePath("/scans");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");
    return { success: `Se cargaron ${values.length} escaneos con éxito.` };
}

export async function deleteScanByEan(ean: string) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };

    const result = await query<ResultSetHeader>(
        'DELETE FROM scannedArticles WHERE ean = ? AND companyId = ?',
        [ean, session.companyId]
    );

    if (result.affectedRows === 0) {
      return { error: "No se encontraron escaneos para este código." };
    }

    revalidatePath("/scans");
    revalidatePath("/ean");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");
    return { success: `Se eliminaron ${result.affectedRows} registros para el código ${ean}.` };
}

export async function deleteAllScans() {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    await query('DELETE FROM scannedArticles WHERE companyId = ?', [session.companyId]);

    revalidatePath("/scans");
    revalidatePath("/ean");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");

    return { success: "Todos los artículos escaneados para tu empresa han sido eliminados." };
}

export async function addSerialsBatch(serials: string[], zoneId: string, countNumber: number) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };

    const validatedFields = serialBatchSchema.safeParse({ serials, zoneId, countNumber });
    if (!validatedFields.success || serials.length === 0) {
        return { error: "Datos de lote de series no válidos." };
    }

    const productsInDb = await query<Product[] & RowDataPacket[]>(
      'SELECT code, sku, description FROM products WHERE code IN (?)', [serials]
    );
    const productMap = new Map(productsInDb.map(p => [p.code, p]));

    const values = serials.map((serial, index) => {
      const productInfo = productMap.get(serial);
      if (!productInfo) return null; // Should not happen if validateEan is used on client
      return [
        `serial-batch-${Date.now()}-${index}`,
        serial,
        productInfo.sku,
        productInfo.description,
        new Date(),
        zoneId,
        session.id,
        countNumber,
        true, // isSerial
        session.companyId
      ];
    }).filter(v => v !== null);
    
    if (values.length === 0) return { success: "No hay nuevas series para agregar." };

    await query(
      'INSERT INTO scannedArticles (id, ean, sku, description, scannedAt, zoneId, userId, countNumber, isSerial, companyId) VALUES ?',
      [values]
    );

    revalidatePath("/scans");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");
    return { success: `Se cargaron ${values.length} números de serie con éxito.` };
}

// --- Dashboard & Report Actions ---
export async function getDashboardStats() {
    const session = await getCurrentUser();
    if (!session) {
        return { eanScansToday: 0, seriesScansToday: 0, activeZones: 0, totalItems: 0, chartData: [] };
    }
    const companyId = session.companyId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [scansToday] = await query<RowDataPacket[]>(
        `SELECT 
            SUM(CASE WHEN isSerial = 0 THEN 1 ELSE 0 END) as eanScansToday,
            SUM(CASE WHEN isSerial = 1 THEN 1 ELSE 0 END) as seriesScansToday
         FROM scannedArticles WHERE companyId = ? AND scannedAt >= ?`,
        [companyId, todayStart]
    );

    const [totals] = await query<RowDataPacket[]>(
        `SELECT 
            (SELECT COUNT(*) FROM zones WHERE companyId = ?) as activeZones,
            (SELECT COUNT(*) FROM scannedArticles WHERE companyId = ?) as totalItems
        `, [companyId, companyId]
    );

    const chartDataResult = await query<RowDataPacket[]>(
        `SELECT 
            z.name,
            SUM(CASE WHEN sa.countNumber = 1 THEN 1 ELSE 0 END) as count1,
            SUM(CASE WHEN sa.countNumber = 2 THEN 1 ELSE 0 END) as count2,
            SUM(CASE WHEN sa.countNumber = 3 THEN 1 ELSE 0 END) as count3
         FROM scannedArticles sa
         JOIN zones z ON sa.zoneId = z.id
         WHERE sa.companyId = ?
         GROUP BY z.name`,
        [companyId]
    );
    
    return {
        eanScansToday: Number(scansToday.eanScansToday) || 0,
        seriesScansToday: Number(scansToday.seriesScansToday) || 0,
        activeZones: Number(totals.activeZones) || 0,
        totalItems: Number(totals.totalItems) || 0,
        chartData: chartDataResult
    };
}

export type CountsReportItem = {
    key: string;
    ean: string;
    sku: string;
    description: string;
    count1_user: string | null;
    count1_zone: string | null;
    count2_user: string | null;
    count2_zone: string | null;
    count3_user: string | null;
    count3_zone: string | null;
}

export async function getCountsReport(): Promise<CountsReportItem[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const sql = `
        SELECT
            p.code AS ean,
            p.sku,
            p.description,
            MAX(CASE WHEN sa.countNumber = 1 THEN u1.name ELSE NULL END) AS count1_user,
            MAX(CASE WHEN sa.countNumber = 1 THEN z1.name ELSE NULL END) AS count1_zone,
            MAX(CASE WHEN sa.countNumber = 2 THEN u2.name ELSE NULL END) AS count2_user,
            MAX(CASE WHEN sa.countNumber = 2 THEN z2.name ELSE NULL END) AS count2_zone,
            MAX(CASE WHEN sa.countNumber = 3 THEN u3.name ELSE NULL END) AS count3_user,
            MAX(CASE WHEN sa.countNumber = 3 THEN z3.name ELSE NULL END) AS count3_zone
        FROM
            (SELECT DISTINCT ean FROM scannedArticles WHERE companyId = ?) AS distinct_eans
        LEFT JOIN products p ON distinct_eans.ean = p.code
        LEFT JOIN scannedArticles sa ON p.code = sa.ean AND sa.companyId = ?
        LEFT JOIN users u1 ON sa.userId = u1.id AND sa.countNumber = 1
        LEFT JOIN zones z1 ON sa.zoneId = z1.id AND sa.countNumber = 1
        LEFT JOIN users u2 ON sa.userId = u2.id AND sa.countNumber = 2
        LEFT JOIN zones z2 ON sa.zoneId = z2.id AND sa.countNumber = 2
        LEFT JOIN users u3 ON sa.userId = u3.id AND sa.countNumber = 3
        LEFT JOIN zones z3 ON sa.zoneId = z3.id AND sa.countNumber = 3
        GROUP BY
            p.code, p.sku, p.description
        ORDER BY
            p.code;
    `;
    const reportData = await query<(CountsReportItem & RowDataPacket)[]>(sql, [session.companyId, session.companyId]);
    return reportData.map(item => ({ ...item, key: item.ean }));
}

export type SkuSummaryItem = {
    sku: string;
    description: string;
    count1: number;
    count2: number;
    count3: number;
    total: number;
};

export async function getSkuSummary(): Promise<SkuSummaryItem[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const sql = `
        SELECT
            sku,
            MAX(description) as description,
            SUM(CASE WHEN countNumber = 1 THEN 1 ELSE 0 END) as count1,
            SUM(CASE WHEN countNumber = 2 THEN 1 ELSE 0 END) as count2,
            SUM(CASE WHEN countNumber = 3 THEN 1 ELSE 0 END) as count3,
            COUNT(*) as total
        FROM scannedArticles
        WHERE companyId = ? AND sku IS NOT NULL AND sku != 'N/A'
        GROUP BY sku
        ORDER BY sku;
    `;
    const summaryData = await query<(SkuSummaryItem & RowDataPacket)[]>(sql, [session.companyId]);
    return summaryData;
}


export type ZoneSummaryItem = {
    zoneName: string;
    count1: number;
    count2: number;
    count3: number;
    total: number;
};

export async function getZoneSummary(): Promise<ZoneSummaryItem[]> {
    const session = await getCurrentUser();
    if (!session) return [];
    
    const sql = `
        SELECT
            z.name as zoneName,
            SUM(CASE WHEN sa.countNumber = 1 THEN 1 ELSE 0 END) as count1,
            SUM(CASE WHEN sa.countNumber = 2 THEN 1 ELSE 0 END) as count2,
            SUM(CASE WHEN sa.countNumber = 3 THEN 1 ELSE 0 END) as count3,
            COUNT(sa.id) as total
        FROM zones z
        JOIN scannedArticles sa ON z.id = sa.zoneId
        WHERE z.companyId = ?
        GROUP BY z.name
        ORDER BY z.name;
    `;
    const summaryData = await query<(ZoneSummaryItem & RowDataPacket)[]>(sql, [session.companyId]);
    return summaryData;
}
