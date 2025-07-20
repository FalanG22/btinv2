import PageHeader from "@/components/page-header";
import { getCountsReport } from "@/lib/actions";
import { CountsReportTable } from "./counts-report-table";
import { ListChecks } from "lucide-react";

export default async function ReportPage() {
    const reportData = await getCountsReport();

    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
            <PageHeader
                title="Counts Report"
                description="Summary of users who performed each count for every article and zone."
            />
            <CountsReportTable data={reportData} />
        </div>
    );
}
