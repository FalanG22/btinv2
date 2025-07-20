
import PageHeader from "@/components/page-header";
import { getSkuSummary } from "@/lib/actions";
import { SkuSummaryTable } from "./sku-summary-table";
import { ExportButton } from "@/components/export-button";

export default async function SkuSummaryPage() {
    const summaryData = await getSkuSummary();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Resumen por SKU"
                description="Cantidades totales escaneadas para cada SKU en los diferentes conteos."
            >
                <ExportButton data={summaryData} filename="resumen-por-sku" />
            </PageHeader>
            <SkuSummaryTable data={summaryData} />
        </div>
    );
}
