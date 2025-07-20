
import PageHeader from "@/components/page-header";
import { getScannedArticles } from "@/lib/actions";
import { ScansTable, type GroupedScan } from "./scans-table";

export default async function ScansPage() {
    const articles = await getScannedArticles();

    const groupedScans = articles.reduce((acc, article) => {
        const key = article.isSerial 
            ? article.ean 
            : `${article.ean}-${article.zoneId}-${article.countNumber}`;

        const existing = acc.find(item => item.key === key);

        if (existing) {
            existing.quantity++;
            if (new Date(article.scannedAt) > new Date(existing.lastScannedAt)) {
                existing.lastScannedAt = article.scannedAt;
            }
        } else {
            acc.push({
                key: key,
                ean: article.ean,
                sku: article.sku,
                description: article.description,
                isSerial: !!article.isSerial,
                zoneName: article.zoneName,
                countNumber: article.countNumber,
                lastScannedAt: article.scannedAt,
                quantity: 1
            });
        }
        return acc;

    }, [] as GroupedScan[]).sort((a, b) => new Date(b.lastScannedAt).getTime() - new Date(a.lastScannedAt).getTime());

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Historial de Escaneos"
                description="Ver y gestionar todos los artículos que han sido escaneados."
            >
            </PageHeader>

            <ScansTable data={groupedScans} />
        </div>
    );
}
