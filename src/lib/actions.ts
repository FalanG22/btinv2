"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDbScannedArticles, getDbZones, setDbScannedArticles, setDbZones, type ScannedArticle, type Zone } from "./data";
import { scanSchema, zoneSchema, scanBatchSchema, serialBatchSchema } from "./schemas";

// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Zone Actions ---

export async function getZones(): Promise<Zone[]> {
  await delay(50); // Simulate network latency
  return getDbZones().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addZone(data: z.infer<typeof zoneSchema>) {
  const validatedFields = zoneSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }

  const { name, description } = validatedFields.data;
  const zones = getDbZones();
  const newZone: Zone = {
    id: `zone-${Date.now()}`,
    name,
    description,
    createdAt: new Date().toISOString(),
  };

  setDbZones([newZone, ...zones]);
  revalidatePath("/zones");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: `Zone "${name}" created successfully.` };
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

  zones[zoneIndex] = { ...zones[zoneIndex], name, description };
  setDbZones(zones);

  revalidatePath("/zones");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: `Zone "${name}" updated successfully.` };
}

export async function deleteZone(zoneId: string) {
  let zones = getDbZones();
  const zoneName = zones.find(z => z.id === zoneId)?.name;
  setDbZones(zones.filter(z => z.id !== zoneId));
  
  revalidatePath("/zones");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: `Zone "${zoneName}" deleted successfully.` };
}

// --- Article Scan Actions ---

export async function getScannedArticles(): Promise<ScannedArticle[]> {
  await delay(50);
  return getDbScannedArticles().sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
}

export async function addScansBatch(scans: z.infer<typeof scanBatchSchema>) {
    const validatedFields = scanBatchSchema.safeParse(scans);

    if (!validatedFields.success) {
        return { error: "Invalid batch data provided." };
    }

    const zones = getDbZones();
    const allArticles = getDbScannedArticles();

    const newScans: ScannedArticle[] = validatedFields.data.map((scan, index) => {
        const zone = zones.find(z => z.id === scan.zoneId);
        return {
            id: `scan-batch-${Date.now()}-${index}`,
            ean: scan.ean,
            zoneId: scan.zoneId,
            zoneName: zone?.name || 'Unknown Zone',
            scannedAt: scan.scannedAt,
            userId: `user-batch-${Math.ceil(Math.random() * 3)}`,
            countNumber: scan.countNumber,
            isSerial: false,
        };
    });

    setDbScannedArticles([...newScans, ...allArticles]);
    revalidatePath("/");
    revalidatePath("/ean");
    revalidatePath("/articles");
    revalidatePath("/dashboard");
    return { success: `Successfully uploaded ${newScans.length} scans.` };
}

export async function deleteScan(scanId: string) {
  let articles = getDbScannedArticles();
  setDbScannedArticles(articles.filter(a => a.id !== scanId));

  revalidatePath("/articles");
  revalidatePath("/");
  revalidatePath("/ean");
  revalidatePath("/dashboard");
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

     if (!zone) {
        return { error: "Selected zone not found." };
    }

    const newEntries: ScannedArticle[] = serials.map((serial, index) => ({
        id: `serial-batch-${Date.now()}-${index}`,
        ean: serial,
        zoneId: zoneId,
        zoneName: zone.name,
        scannedAt: new Date().toISOString(),
        userId: `user-serial-${Math.ceil(Math.random() * 3)}`,
        countNumber: countNumber,
        isSerial: true,
    }));

    setDbScannedArticles([...newEntries, ...allArticles]);
    revalidatePath("/articles");
    revalidatePath("/serials");
    revalidatePath("/dashboard");
    return { success: `Successfully uploaded ${newEntries.length} serial numbers.` };
}

// --- Dashboard Actions ---

export async function getDashboardStats() {
    await delay(100);
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
