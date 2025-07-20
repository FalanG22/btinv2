
import PageHeader from "@/components/page-header";
import { getScannedArticles } from "@/lib/actions";
import { ScansTable } from "./scans-table";

export default async function ScansPage() {
    const articles = await getScannedArticles();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Historial de Escaneos"
                description="Ver y gestionar todos los artículos que han sido escaneados."
            >
            </PageHeader>

            <ScansTable data={articles} />
        </div>
    );
}
