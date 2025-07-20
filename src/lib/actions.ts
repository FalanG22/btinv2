"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDbScannedArticles, getDbZones, setDbScannedArticles, setDbZones, type ScannedArticle, type Zone } from "./data";
import { scanSchema, zoneSchema } from "./schemas";

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

export async function getRecentScans(limit: number): Promise<ScannedArticle[]> {
  const articles = await getScannedArticles();
  return articles.slice(0, limit);
}

export async function addScan(data: z.infer<typeof scanSchema>) {
  const validatedFields = scanSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }
  
  const { ean, zoneId } = validatedFields.data;
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
