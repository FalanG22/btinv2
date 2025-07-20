import PageHeader from "@/components/page-header";
import SerialsClient from "./serials-client";
import { getZones } from "@/lib/actions";

export default async function SerialsPage() {
    const zones = await getZones();
    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
            <SerialsClient zones={zones} />
        </div>
    );
}
