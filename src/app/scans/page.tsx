
import PageHeader from "@/components/page-header";
import { getScannedArticles } from "@/lib/actions";
import { ScansTable, type GroupedScan } from "./scans-table";
import { DeleteAllButton } from "./delete-all-button";

export default async function ScansPage() {
    const articles = await getScannedArticles();

    const groupedScans = articles.reduce((acc, article) => {
        const key = article.ean;
        
        if (article.isSerial) {
            // Serials are unique, push them directly
            acc.push({
                ean: article.ean,
                sku: article.sku,
                description: article.description,
                isSerial: true,
                zoneName: article.zoneName,
                countNumber: article.countNumber,
                lastScannedAt: article.scannedAt,
                quantity: 1
            });
            return acc;
        }

        const existing = acc.find(item => item.ean === key && !item.isSerial);

        if (existing) {
            existing.quantity++;
            // Update to the latest scan time if this one is newer
            if (new Date(article.scannedAt) > new Date(existing.lastScannedAt)) {
                existing.lastScannedAt = article.scannedAt;
                existing.zoneName = article.zoneName; // Also update other relevant data
                existing.countNumber = article.countNumber;
            }
        } else {
            acc.push({
                ean: article.ean,
                sku: article.sku,
                description: article.description,
                isSerial: false,
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
                <DeleteAllButton disabled={articles.length === 0} />
            </PageHeader>

            <ScansTable data={groupedScans} />
        </div>
    );
}
