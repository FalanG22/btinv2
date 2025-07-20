import { getZones } from "@/lib/actions";
import PageHeader from "@/components/page-header";
import { ZonesTable } from "./zones-table";
import { ZoneBuilderDialog } from "./zone-builder-dialog";


export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader
        title="Zone Management"
        description="Create and manage your logistical zones."
      >
        <ZoneBuilderDialog />
      </PageHeader>
      
      <ZonesTable data={zones} />
    </div>
  );
}
