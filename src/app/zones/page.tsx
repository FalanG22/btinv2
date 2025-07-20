
import { getZones } from "@/lib/actions";
import PageHeader from "@/components/page-header";
import { ZonesTable } from "./zones-table";
import { ZoneBuilderDialog } from "./zone-builder-dialog";
import { PrintZonesDialog } from "./print-zones-dialog";


export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="grid flex-1 items-start gap-4 lg:gap-8">
      <PageHeader
        title="Gestión de Zonas"
        description="Crea y gestiona tus zonas logísticas."
      >
        <div className="flex items-center gap-2">
            <ZoneBuilderDialog />
            <PrintZonesDialog zones={zones} />
        </div>
      </PageHeader>
      
      <ZonesTable data={zones} />
    </div>
  );
}
