
import PageHeader from "@/components/page-header";
import { getZoneSummary } from "@/lib/actions";
import { ZoneSummaryTable } from "./zone-summary-table";
import { ExportButton } from "@/components/export-button";

export default async function ZoneSummaryPage() {
    const summaryData = await getZoneSummary();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Resumen por Zona"
                description="Cantidades totales escaneadas para cada zona en los diferentes conteos."
            >
                <ExportButton data={summaryData} filename="resumen-por-zona" />
            </PageHeader>
            <ZoneSummaryTable data={summaryData} />
        </div>
    );
}
