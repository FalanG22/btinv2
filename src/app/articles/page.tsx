import PageHeader from "@/components/page-header";
import { getScannedArticles } from "@/lib/actions";
import { CsvUpload } from "./csv-upload";
import { ArticlesTable } from "./articles-table";

export default async function ArticlesPage() {
    const articles = await getScannedArticles();

    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
            <PageHeader
                title="Gestión de Artículos"
                description="Ver y gestionar todos los artículos escaneados."
            >
                <CsvUpload />
            </PageHeader>

            <ArticlesTable data={articles} />
        </div>
    );
}
