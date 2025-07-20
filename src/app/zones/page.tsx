import { getZones } from "@/lib/actions";
import PageHeader from "@/components/page-header";
import { ZoneDialog } from "./zone-dialog";
import { ZonesTable } from "./zones-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader
        title="Zone Management"
        description="Create and manage your logistical zones."
      >
        <ZoneDialog>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Add Zone
          </Button>
        </ZoneDialog>
      </PageHeader>
      
      <ZonesTable data={zones} />
    </div>
  );
}
