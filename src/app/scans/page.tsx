import PageHeader from "@/components/page-header";
import { getScannedArticles } from "@/lib/actions";
import { ScansTable } from "./scans-table";
import { DeleteAllButton } from "./delete-all-button";

export default async function ScansPage() {
    const articles = await getScannedArticles();

    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
            <PageHeader
                title="Historial de Escaneos"
                description="Ver y gestionar todos los artículos que han sido escaneados."
            >
                <DeleteAllButton disabled={articles.length === 0} />
            </PageHeader>

            <ScansTable data={articles} />
        </div>
    );
}
