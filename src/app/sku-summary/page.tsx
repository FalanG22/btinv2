
import PageHeader from "@/components/page-header";
import { getSkuSummary } from "@/lib/actions";
import { SkuSummaryTable } from "./sku-summary-table";

export default async function SkuSummaryPage() {
    const summaryData = await getSkuSummary();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Resumen por SKU"
                description="Cantidades totales escaneadas para cada SKU en los diferentes conteos."
            />
            <SkuSummaryTable data={summaryData} />
        </div>
    );
}
