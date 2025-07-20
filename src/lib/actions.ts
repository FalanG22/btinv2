
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDbScannedArticles, getDbZones, setDbScannedArticles, setDbZones, type ScannedArticle, type Zone, getDbProducts, getDbUsers, getDbCompanies, setDbUsers, type User, type Company } from "./data";
import { scanSchema, zoneSchema, scanBatchSchema, serialBatchSchema, zoneBuilderSchema, userSchema } from "./schemas";

// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User Actions ---
export async function getUsers(): Promise<User[]> {
  await delay(50);
  return getDbUsers();
}

export async function deleteUser(userId: string) {
    if (userId === 'user-admin') {
        return { error: "Cannot delete the default admin user." };
    }
    let users = getDbUsers();
    setDbUsers(users.filter(u => u.id !== userId));
    revalidatePath("/users");
    return { success: "User deleted successfully." };
}

export async function createUser(data: z.infer<typeof userSchema>) {
    const validatedFields = userSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: "Invalid data provided." };
    }
    const { name, email, companyId, role } = validatedFields.data;
    let users = getDbUsers();
    if (users.some(u => u.email === email)) {
        return { error: "A user with this email already exists." };
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        companyId,
        role,
        createdAt: new Date().toISOString(),
    };
    setDbUsers([newUser, ...users]);
    revalidatePath("/users");
    return { success: `User "${name}" created successfully.` };
}

export async function updateUser(data: z.infer<typeof userSchema>) {
    const validatedFields = userSchema.safeParse(data);
    if (!validatedFields.success || !validatedFields.data.id) {
        return { error: "Invalid data provided." };
    }
    const { id, name, email, companyId, role } = validatedFields.data;
    let users = getDbUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return { error: "User not found." };
    }

    // Prevent changing email to one that already exists
    if (users.some(u => u.email === email && u.id !== id)) {
        return { error: "Another user with this email already exists." };
    }

    users[userIndex] = { ...users[userIndex], name, email, companyId, role };
    setDbUsers(users);

    revalidatePath("/users");
    return { success: `User "${name}" updated successfully.` };
}

// --- Company Actions ---
export async function getCompanies(): Promise<Company[]> {
    await delay(50);
    return getDbCompanies();
}


// --- Zone Actions ---

export async function getZones(): Promise<Zone[]> {
  await delay(50); // Simulate network latency
  // In a real app, you would filter by companyId from the user's session
  return getDbZones().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addZonesBatch(data: z.infer<typeof zoneBuilderSchema>) {
    const validatedFields = zoneBuilderSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid data provided for zone builder." };
    }

    const { streetPrefix, streetFrom, streetTo, rackPrefix, rackFrom, rackTo } = validatedFields.data;
    const zones = getDbZones();
    const newZones: Zone[] = [];
    const companyId = 'company-1'; // Hardcoded for demo

    for (let s = streetFrom; s <= streetTo; s++) {
        for (let r = rackFrom; r <= rackTo; r++) {
            const street = s.toString().padStart(2, '0');
            const rack = r.toString().padStart(2, '0');
            const zoneName = `${streetPrefix}${street}-${rackPrefix}${rack}`;
            
            // Avoid creating duplicates for the same company
            if (!zones.some(z => z.name === zoneName && z.companyId === companyId) && !newZones.some(z => z.name === zoneName)) {
                 newZones.push({
                    id: `zone-${Date.now()}-${s}-${r}`,
                    name: zoneName,
                    description: `Zone located at Street ${street}, Rack ${rack}`,
                    createdAt: new Date().toISOString(),
                    companyId: companyId,
                });
            }
        }
    }
    
    if (newZones.length === 0) {
        return { error: "No new zones to create. They might already exist." };
    }

    setDbZones([...newZones, ...zones]);
    revalidatePath("/zones");
    revalidatePath("/ean"); // Revalidate EAN scanning page
    revalidatePath("/serials"); // Revalidate Serials scanning page
    revalidatePath("/dashboard");
    return { success: `${newZones.length} zones created successfully.` };
}


export async function updateZone(data: z.infer<typeof zoneSchema>) {
  const validatedFields = zoneSchema.safeParse(data);

  if (!validatedFields.success || !validatedFields.data.id) {
    return { error: "Invalid data provided." };
  }

  const { id, name, description } = validatedFields.data;
  let zones = getDbZones();
  const zoneIndex = zones.findIndex(z => z.id === id);

  if (zoneIndex === -1) {
    return { error: "Zone not found." };
  }

  // In a real app, check if user has permission for this zone's company
  zones[zoneIndex] = { ...zones[zoneIndex], name, description };
  setDbZones(zones);

  revalidatePath("/zones");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  return { success: `Zone "${name}" updated successfully.` };
}

export async function deleteZone(zoneId: string) {
  let zones = getDbZones();
  const zoneName = zones.find(z => z.id === zoneId)?.name;
  // In a real app, check permissions
  setDbZones(zones.filter(z => z.id !== zoneId));
  
  revalidatePath("/zones");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  return { success: `Zone "${zoneName}" deleted successfully.` };
}

// --- Article Scan Actions ---

export async function getScannedArticles(): Promise<ScannedArticle[]> {
  await delay(50);
  const articles = getDbScannedArticles();
  const zones = getDbZones();
  
  // In a real app, you would filter articles and zones by companyId
  
  return articles
    .map(article => ({
        ...article,
        zoneName: zones.find(z => z.id === article.zoneId)?.name || 'Unknown Zone'
    }))
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
}

export async function addScansBatch(scans: z.infer<typeof scanBatchSchema>) {
    const validatedFields = scanBatchSchema.safeParse(scans);

    if (!validatedFields.success) {
        return { error: "Invalid batch data provided." };
    }
    
    // In a real app, get companyId and userId from session
    const companyId = 'company-1'; 
    const userId = `user-${Math.ceil(Math.random() * 3)}`;


    const zones = getDbZones();
    const allArticles = getDbScannedArticles();
    const products = getDbProducts();

    const newScans: ScannedArticle[] = validatedFields.data.map((scan, index) => {
        const zone = zones.find(z => z.id === scan.zoneId);
        const productInfo = products.find(p => p.code === scan.ean);
        return {
            id: `scan-batch-${Date.now()}-${index}`,
            ean: scan.ean,
            sku: productInfo?.sku || 'N/A',
            description: productInfo?.description || 'Producto no encontrado',
            zoneId: scan.zoneId,
            zoneName: zone?.name || 'Unknown Zone',
            scannedAt: scan.scannedAt,
            userId: userId,
            countNumber: scan.countNumber,
            isSerial: false,
            companyId: companyId,
        };
    });

    setDbScannedArticles([...newScans, ...allArticles]);
    revalidatePath("/ean");
    revalidatePath("/articles");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    return { success: `Successfully uploaded ${newScans.length} scans.` };
}

export async function deleteScan(scanId: string) {
  let articles = getDbScannedArticles();
  // In a real app, check permissions
  setDbScannedArticles(articles.filter(a => a.id !== scanId));

  revalidatePath("/articles");
  revalidatePath("/ean");
  revalidatePath("/serials");
  revalidatePath("/dashboard");
  revalidatePath("/report");
  return { success: "Scan record deleted successfully." };
}

export async function addSerialsBatch(serials: string[], zoneId: string, countNumber: number) {
    const validatedFields = serialBatchSchema.safeParse({ serials, zoneId, countNumber });
     if (!validatedFields.success) {
        return { error: "Invalid serial batch data provided." };
    }

    const zones = getDbZones();
    const allArticles = getDbScannedArticles();
    const zone = zones.find(z => z.id === zoneId);
    const products = getDbProducts();
    
    // In a real app, get companyId and userId from session
    const companyId = 'company-1'; 
    const userId = `user-serial-${Math.ceil(Math.random() * 3)}`;

     if (!zone) {
        return { error: "Selected zone not found." };
    }

    const newEntries: ScannedArticle[] = serials.map((serial, index) => {
        const productInfo = products.find(p => p.code === serial);
        return {
            id: `serial-batch-${Date.now()}-${index}`,
            ean: serial,
            sku: productInfo?.sku || 'N/A',
            description: productInfo?.description || 'Producto no encontrado',
            zoneId: zoneId,
            zoneName: zone.name,
            scannedAt: new Date().toISOString(),
            userId: userId,
            countNumber: countNumber,
            isSerial: true,
            companyId: companyId,
        };
    });

    setDbScannedArticles([...newEntries, ...allArticles]);
    revalidatePath("/articles");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    revalidatePath("/report");
    return { success: `Successfully uploaded ${newEntries.length} serial numbers.` };
}

// --- Dashboard & Report Actions ---

export async function getDashboardStats() {
    await delay(100);
    // In a real app, you would filter these by companyId from session
    const scans = getDbScannedArticles();
    const zones = getDbZones();

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
    await delay(50);
    // In a real app, filter by companyId
    const scans = getDbScannedArticles();
    const products = getDbProducts();

    const reportMap = scans.reduce((acc, scan) => {
        const key = scan.ean; // Group by article code only
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
        const user = getDbUsers().find(u => u.id === scan.userId);

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
