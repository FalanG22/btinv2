import { getRecentScans, getZones } from "@/lib/actions";
import DashboardClient from "./dashboard-client";

export default async function Home() {
  const zones = await getZones();
  const recentScans = await getRecentScans(5);

  return (
    <DashboardClient zones={zones} initialRecentScans={recentScans} />
  );
}
