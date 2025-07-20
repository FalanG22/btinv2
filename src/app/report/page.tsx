
import PageHeader from "@/components/page-header";
import { getCountsReport } from "@/lib/actions";
import { CountsReportTable } from "./counts-report-table";
import { ListChecks } from "lucide-react";

export default async function ReportPage() {
    const reportData = await getCountsReport();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Informe de Conteos"
                description="Resumen de usuarios que realizaron cada conteo para cada artículo y zona."
            />
            <CountsReportTable data={reportData} />
        </div>
    );
}
