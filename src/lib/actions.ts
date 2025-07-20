
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDbScannedArticles, getDbZones, setDbScannedArticles, setDbZones, type ScannedArticle, type Zone, getDbProducts, getDbUsers, getDbCompanies, setDbUsers, type User, type Company, type Product, setDbProducts } from "./data";
import { scanSchema, zoneSchema, scanBatchSchema, serialBatchSchema, zoneBuilderSchema, userSchema, productsCsvSchema } from "./schemas";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";

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

  // An admin can only see users from their own company.
  return getDbUsers().filter(u => u.companyId === session.companyId);
}

export async function deleteUser(userId: string) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'admin') {
        return { error: "No autorizado." };
    }

    if (userId === 'user-admin' || userId === 'user-admin-bt') {
        return { error: "No se puede eliminar el usuario administrador por defecto." };
    }
    let users = getDbUsers();
    const userToDelete = users.find(u => u.id === userId);

    if (!userToDelete) {
        return { error: "Usuario no encontrado." };
    }

    // Security check: ensure admin can only delete users from their own company
    if (userToDelete.companyId !== session.companyId) {
        return { error: "No tienes permiso para eliminar este usuario." };
    }

    setDbUsers(users.filter(u => u.id !== userId));
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

    let users = getDbUsers();
    if (users.some(u => u.email === email)) {
        return { error: "Ya existe un usuario con este correo electrónico." };
    }
    
    // In a real app, the companyId should be validated against the admin's own company,
    // unless they are a super-admin. Here we allow it for demo purposes.

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        companyId,
        role,
        createdAt: new Date().toISOString(),
        // In a real app, you would hash the password here before saving
        password: password || 'password123' // fallback for demo
    };
    
    setDbUsers([newUser, ...users]);
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
    let users = getDbUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return { error: "Usuario no encontrado." };
    }

    // Security check: ensure admin can only update users in their own company
    if (users[userIndex].companyId !== session.companyId) {
         return { error: "No tienes permiso para actualizar este usuario." };
    }

    // Prevent changing email to one that already exists
    if (users.some(u => u.email === email && u.id !== id)) {
        return { error: "Ya existe otro usuario con este correo electrónico." };
    }

    users[userIndex] = { ...users[userIndex], name, email, companyId, role };

    if (password) {
      // In a real app, you would hash the new password here
      users[userIndex].password = password;
    }

    setDbUsers(users);

    revalidatePath("/users");
    return { success: `Usuario "${name}" actualizado con éxito.` };
}

// --- Company Actions ---
export async function getCompanies(): Promise<Company[]> {
    const session = await getCurrentUser();
    if (!session) return [];
    // In this demo, an admin can see all companies to assign users,
    // but in a strict multi-tenant system, this might be restricted.
    return getDbCompanies();
}


// --- Zone Actions ---

export async function getZones(): Promise<Zone[]> {
    const session = await getCurrentUser();
    if (!session) return [];
    
    // Filter zones by the logged-in user's company
    return getDbZones()
        .filter(z => z.companyId === session.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getZonesForPrint(fromZoneId: string, toZoneId: string): Promise<Zone[]> {
    const session = await getCurrentUser();
    if (!session) return [];

    const allZonesForCompany = getDbZones()
        .filter(z => z.companyId === session.companyId)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
    const fromIndex = allZonesForCompany.findIndex(z => z.id === fromZoneId);
    const toIndex = allZonesForCompany.findIndex(z => z.id === toZoneId);

    if (fromIndex === -1 || toIndex === -1) {
        return [];
    }
    
    return allZonesForCompany.slice(fromIndex, toIndex + 1);
}


export async function addZonesBatch(data: z.infer<typeof zoneBuilderSchema>) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    const validatedFields = zoneBuilderSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Datos proporcionados no válidos para el constructor de zonas." };
    }

    const { streetPrefix, streetFrom, streetTo, rackPrefix, rackFrom, rackTo } = validatedFields.data;
    const zones = getDbZones();
    const newZones: Zone[] = [];
    const companyId = session.companyId; 

    for (let s = streetFrom; s <= streetTo; s++) {
        for (let r = rackFrom; r <= rackTo; r++) {
            const street = s.toString().padStart(2, '0');
            const rack = r.toString().padStart(2, '0');
            const zoneName = `${streetPrefix}${street}-${rackPrefix}${rack}`;
            
            if (!zones.some(z => z.name === zoneName && z.companyId === companyId) && !newZones.some(z => z.name === zoneName)) {
                 newZones.push({
                    id: `zone-${Date.now()}-${s}-${r}`,
                    name: zoneName,
                    description: `Zona ubicada en Calle ${street}, Estantería ${rack}`,
                    createdAt: new Date().toISOString(),
                    companyId: companyId,
                });
            }
        }
    }
    
    if (newZones.length === 0) {
        return { error: "No hay nuevas zonas para crear. Puede que ya existan." };
    }

    setDbZones([...newZones, ...zones]);
    revalidatePath("/zones");
    revalidatePath("/ean"); 
    revalidatePath("/serials"); 
    revalidatePath("/dashboard");
    return { success: `${newZones.length} zonas creadas con éxito.` };
}


export async function updateZone(data: z.infer<typeof zoneSchema>) {
  const session = await getCurrentUser();
  if (!session) return { error: "No autorizado." };

  const validatedFields = zoneSchema.safeParse(data);

  if (!validatedFields.success || !validatedFields.data.id) {
    return { error: "Datos proporcionados no válidos." };
  }

  const { id, name, description } = validatedFields.data;
  let zones = getDbZones();
  const zoneIndex = zones.findIndex(z => z.id === id);

  if (zoneIndex === -1) {
    return { error: "Zona no encontrada." };
  }

  // Security check: ensure user has permission for this zone's company
  if (zones[zoneIndex].companyId !== session.companyId) {
      return { error: "No tienes permiso para actualizar esta zona." };
  }

  zones[zoneIndex] = { ...zones[zoneIndex], name, description };
  setDbZones(zones);

  revalidatePath("/zones");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  return { success: `Zona "${name}" actualizada con éxito.` };
}

export async function deleteZone(zoneId: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "No autorizado." };

  let zones = getDbZones();
  const zone = zones.find(z => z.id === zoneId);

  // Security check
  if (!zone || zone.companyId !== session.companyId) {
      return { error: "No tienes permiso para eliminar esta zona." };
  }
  
  const zoneName = zone.name;
  setDbZones(zones.filter(z => z.id !== zoneId));
  
  revalidatePath("/zones");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  return { success: `Zona "${zoneName}" eliminada con éxito.` };
}


// --- Master Product Actions ---
export async function getProducts(): Promise<Product[]> {
    // This now reads from localStorage-backed store
    return getDbProducts();
}

export async function addProductsFromCsv(products: Product[]) {
    const session = await getCurrentUser();
    if (!session) {
        return { error: "No autorizado." };
    }

    const validatedFields = productsCsvSchema.safeParse(products);
    if (!validatedFields.success) {
        return { error: "El formato del CSV no es válido. Asegúrate de que tenga las columnas 'code', 'sku', y 'description'." };
    }

    let allProducts = getDbProducts();
    const newOrUpdatedProducts = new Map(allProducts.map(p => [p.code, p]));

    for (const product of validatedFields.data) {
        newOrUpdatedProducts.set(product.code, product);
    }
    
    setDbProducts(Array.from(newOrUpdatedProducts.values()));

    revalidatePath("/articles");
    return { success: `${products.length} artículos importados o actualizados correctamente.` };
}

export async function validateEan(ean: string): Promise<{ exists: boolean; isSerial: boolean }> {
  const products = getDbProducts();
  const product = products.find(p => p.code === ean);
  const exists = !!product;
  
  // A simple heuristic to determine if it's a serial number
  const isSerial = exists ? /^[a-zA-Z]/.test(product.code) : false;
  
  return { exists, isSerial };
}


export async function deleteAllProducts() {
    const session = await getCurrentUser();
    if (!session) {
        return { error: "No autorizado." };
    }
    // For the demo, we'll allow it and clear the entire list from localStorage
    setDbProducts([]);
    revalidatePath("/articles");
    revalidatePath("/ean");
    revalidatePath("/serials");
    return { success: "Todos los artículos del maestro han sido eliminados." };
}


// --- Article Scan Actions ---

export async function getScannedArticles(): Promise<ScannedArticle[]> {
  const session = await getCurrentUser();
  if (!session) return [];
  
  const articles = getDbScannedArticles().filter(a => a.companyId === session.companyId);
  const zones = getDbZones().filter(z => z.companyId === session.companyId);
  
  return articles
    .map(article => ({
        ...article,
        zoneName: zones.find(z => z.id === article.zoneId)?.name || 'Zona Desconocida'
    }))
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
}

export async function addScansBatch(scans: z.infer<typeof scanBatchSchema>) {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };
    
    const validatedFields = scanBatchSchema.safeParse(scans);

    if (!validatedFields.success) {
        return { error: "Datos de lote no válidos." };
    }
    
    const companyId = session.companyId; 
    const userId = session.id;


    const zones = getDbZones();
    const allArticles = getDbScannedArticles();
    const products = getDbProducts();

    const newScans: ScannedArticle[] = [];
    for (const [index, scan] of validatedFields.data.entries()) {
        const productInfo = products.find(p => p.code === scan.ean);
        if (!productInfo) {
            return { error: `El artículo con EAN "${scan.ean}" no existe en el maestro de productos.` };
        }

        const zone = zones.find(z => z.id === scan.zoneId && z.companyId === companyId);
        newScans.push({
            id: `scan-batch-${Date.now()}-${index}`,
            ean: scan.ean,
            sku: productInfo?.sku || 'N/A',
            description: productInfo?.description || 'Producto no encontrado',
            zoneId: scan.zoneId,
            zoneName: zone?.name || 'Zona Desconocida',
            scannedAt: scan.scannedAt,
            userId: userId,
            countNumber: scan.countNumber,
            isSerial: false,
            companyId: companyId,
        });
    }

    setDbScannedArticles([...newScans, ...allArticles]);
    revalidatePath("/ean");
    revalidatePath("/scans");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");
    return { success: `Se cargaron ${newScans.length} escaneos con éxito.` };
}

export async function deleteScanByEan(ean: string) {
  const session = await getCurrentUser();
  if (!session) return { error: "No autorizado." };

  let articles = getDbScannedArticles();
  const scansForEan = articles.filter(a => a.ean === ean && a.companyId === session.companyId);

  if (scansForEan.length === 0) {
      return { error: "No se encontraron escaneos para este código." };
  }

  setDbScannedArticles(articles.filter(a => a.ean !== ean || a.companyId !== session.companyId));

  revalidatePath("/scans");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  revalidatePath("/report");
  revalidatePath("/sku-summary");
  revalidatePath("/zone-summary");
  return { success: `Se eliminaron ${scansForEan.length} registros para el código ${ean}.` };
}

export async function deleteAllScans() {
    const session = await getCurrentUser();
    if (!session) return { error: "No autorizado." };

    const companyId = session.companyId;
    let allScans = getDbScannedArticles();
    
    const scansForOtherCompanies = allScans.filter(a => a.companyId !== companyId);
    
    setDbScannedArticles(scansForOtherCompanies);

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
     if (!validatedFields.success) {
        return { error: "Datos de lote de series no válidos." };
    }

    const zones = getDbZones();
    const allArticles = getDbScannedArticles();
    const zone = zones.find(z => z.id === zoneId);
    const products = getDbProducts();
    
    const companyId = session.companyId; 
    const userId = session.id;

    if (!zone || zone.companyId !== companyId) {
        return { error: "Zona seleccionada no encontrada o no tienes permiso." };
    }
    
    const newEntries: ScannedArticle[] = [];
    for(const [index, serial] of serials.entries()) {
        const productInfo = products.find(p => p.code === serial);
        if (!productInfo) {
            return { error: `La serie "${serial}" no existe en el maestro de productos.` };
        }

        newEntries.push({
            id: `serial-batch-${Date.now()}-${index}`,
            ean: serial, // Storing serial in ean field
            sku: productInfo?.sku || 'N/A',
            description: productInfo?.description || 'Producto no encontrado',
            zoneId: zoneId,
            zoneName: zone.name,
            scannedAt: new Date().toISOString(),
            userId: userId,
            countNumber: countNumber,
            isSerial: true,
            companyId: companyId,
        });
    }


    setDbScannedArticles([...newEntries, ...allArticles]);
    revalidatePath("/scans");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    revalidatePath("/sku-summary");
    revalidatePath("/zone-summary");
    return { success: `Se cargaron ${newEntries.length} números de serie con éxito.` };
}

// --- Dashboard & Report Actions ---

export async function getDashboardStats() {
    const session = await getCurrentUser();
    if (!session) {
        return {
            eanScansToday: 0, seriesScansToday: 0, activeZones: 0,
            totalItems: 0, chartData: []
        };
    }
    const companyId = session.companyId;
    const scans = getDbScannedArticles().filter(s => s.companyId === companyId);
    const zones = getDbZones().filter(z => z.companyId === companyId);

    const today = new Date().toDateString();
    const todayScans = scans.filter(scan => new Date(scan.scannedAt).toDateString() === today);
    
    const eanScansToday = todayScans.filter(scan => !scan.isSerial).length;
    const seriesScansToday = todayScans.filter(scan => scan.isSerial).length;
    
    const activeZones = zones.length;
    const totalItems = scans.length;

    const scansByZoneAndCount = scans.reduce((acc, scan) => {
        const zoneName = scan.zoneName;
        if (!acc[zoneName]) {
            acc[zoneName] = { name: zoneName, count1: 0, count2: 0, count3: 0 };
        }
        if (scan.countNumber === 1) {
            acc[zoneName].count1 += 1;
        } else if (scan.countNumber === 2) {
            acc[zoneName].count2 += 1;
        } else if (scan.countNumber === 3) {
            acc[zoneName].count3 += 1;
        }
        return acc;
    }, {} as Record<string, { name: string; count1: number; count2: number; count3: number }>);

    const chartData = Object.values(scansByZoneAndCount);

    return {
        eanScansToday,
        seriesScansToday,
        activeZones,
        totalItems,
        chartData
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

    const companyId = session.companyId;
    const scans = getDbScannedArticles().filter(s => s.companyId === companyId);
    const products = getDbProducts();
    const users = getDbUsers(); // Get all users to find names by ID

    const reportMap = scans.reduce((acc, scan) => {
        const key = scan.ean; 
        const productInfo = products.find(p => p.code === scan.ean);

        if (!acc[key]) {
            acc[key] = {
                key: key,
                ean: scan.ean,
                sku: productInfo?.sku || scan.sku,
                description: productInfo?.description || scan.description,
                count1_user: null,
                count1_zone: null,
                count2_user: null,
                count2_zone: null,
                count3_user: null,
                count3_zone: null,
            };
        }
        const user = users.find(u => u.id === scan.userId);

        if (scan.countNumber === 1) {
            acc[key].count1_user = user?.name || scan.userId;
            acc[key].count1_zone = scan.zoneName;
        } else if (scan.countNumber === 2) {
            acc[key].count2_user = user?.name || scan.userId;
            acc[key].count2_zone = scan.zoneName;
        } else if (scan.countNumber === 3) {
            acc[key].count3_user = user?.name || scan.userId;
            acc[key].count3_zone = scan.zoneName;
        }
        
        return acc;
    }, {} as Record<string, CountsReportItem>);

    return Object.values(reportMap).sort((a, b) => a.ean.localeCompare(b.ean));
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

    const companyId = session.companyId;
    const scans = getDbScannedArticles().filter(s => s.companyId === companyId);

    const summaryMap = scans.reduce((acc, scan) => {
        if (!scan.sku || scan.sku === 'N/A') {
            return acc;
        }
        
        if (!acc[scan.sku]) {
            acc[scan.sku] = {
                sku: scan.sku,
                description: scan.description,
                count1: 0,
                count2: 0,
                count3: 0,
                total: 0,
            };
        }

        const item = acc[scan.sku];
        if (scan.countNumber === 1) item.count1++;
        if (scan.countNumber === 2) item.count2++;
        if (scan.countNumber === 3) item.count3++;
        item.total++;

        return acc;
    }, {} as Record<string, SkuSummaryItem>);

    return Object.values(summaryMap).sort((a, b) => a.sku.localeCompare(b.sku));
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
    
    const companyId = session.companyId;
    const scans = getDbScannedArticles().filter(s => s.companyId === companyId);

    const summaryMap = scans.reduce((acc, scan) => {
        if (!acc[scan.zoneName]) {
            acc[scan.zoneName] = {
                zoneName: scan.zoneName,
                count1: 0,
                count2: 0,
                count3: 0,
                total: 0,
            };
        }

        const item = acc[scan.zoneName];
        if (scan.countNumber === 1) item.count1++;
        if (scan.countNumber === 2) item.count2++;
        if (scan.countNumber === 3) item.count3++;
        item.total++;

        return acc;
    }, {} as Record<string, ZoneSummaryItem>);

    return Object.values(summaryMap).sort((a, b) => a.zoneName.localeCompare(b.zoneName));
}
