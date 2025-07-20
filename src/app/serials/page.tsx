import PageHeader from "@/components/page-header";
import SerialsClient from "./serials-client";
import { getZones } from "@/lib/actions";

export default async function SerialsPage() {
    const zones = await getZones();
    return (
        <SerialsClient zones={zones} />
    );
}
