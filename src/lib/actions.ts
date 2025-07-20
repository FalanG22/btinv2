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
  return { success: `Zone "${name}" updated successfully.` };
}

export async function deleteZone(zoneId: string) {
  let zones = getDbZones();
  const zoneName = zones.find(z => z.id === zoneId)?.name;
  setDbZones(zones.filter(z => z.id !== zoneId));
  
  revalidatePath("/zones");
  revalidatePath("/");
  return { success: `Zone "${zoneName}" deleted successfully.` };
}

// --- Article Scan Actions ---

export async function getScannedArticles(): Promise<ScannedArticle[]> {
  await delay(50);
  return getDbScannedArticles().sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
}

export async function getRecentScans(zoneId: string, countNumber: number, limit: number): Promise<ScannedArticle[]> {
  const articles = await getScannedArticles();
  return articles
    .filter(a => a.zoneId === zoneId && a.countNumber === countNumber)
    .slice(0, limit);
}

export async function addScan(data: z.infer<typeof scanSchema>) {
  const validatedFields = scanSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }
  
  const { ean, zoneId, countNumber } = validatedFields.data;
  const zones = getDbZones();
  const zone = zones.find(z => z.id === zoneId);

  if (!zone) {
    return { error: "Selected zone not found." };
  }

  const newScan: ScannedArticle = {
    id: `scan-${Date.now()}`,
    ean,
    zoneId,
    zoneName: zone.name,
    scannedAt: new Date().toISOString(),
    userId: `user-${Math.ceil(Math.random() * 3)}`, // Simulate a random user
    countNumber,
  };

  let articles = getDbScannedArticles();
  setDbScannedArticles([newScan, ...articles]);

  revalidatePath("/");
  revalidatePath("/articles");
  return { success: `Article ${ean} scanned in zone "${zone.name}".`, newScan };
}

export async function deleteScan(scanId: string) {
  let articles = getDbScannedArticles();
  setDbScannedArticles(articles.filter(a => a.id !== scanId));

  revalidatePath("/articles");
  revalidatePath("/");
  return { success: "Scan record deleted successfully." };
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
        };
    });

    setDbScannedArticles([...newScans, ...allArticles]);
    revalidatePath("/");
    revalidatePath("/articles");
    return { success: `Successfully uploaded ${newScans.length} scans.` };
}

export async function addSerialsBatch(serials: string[], zoneId: string, countNumber: number) {
    // In a real app, you would save these serials to a dedicated serials table.
    // For this demo, we will create ScannedArticle entries with the serial as the EAN.
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
        ean: serial, // Using EAN field to store serial number
        zoneId: zoneId,
        zoneName: zone.name,
        scannedAt: new Date().toISOString(),
        userId: `user-serial-${Math.ceil(Math.random() * 3)}`,
        countNumber: countNumber,
    }));

    setDbScannedArticles([...newEntries, ...allArticles]);
    revalidatePath("/articles"); // To see the result in the articles table
    return { success: `Successfully uploaded ${newEntries.length} serial numbers.` };
}
