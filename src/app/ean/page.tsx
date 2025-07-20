import { getZones } from "@/lib/actions";
import DashboardClient from "../dashboard-client";

export default async function EanPage() {
  const zones = await getZones();

  return (
    <DashboardClient zones={zones} />
  );
}
