
import PageHeader from "@/components/page-header";
import { getProducts } from "@/lib/actions";
import { CsvUpload } from "./csv-upload";
import { ArticlesTable } from "./articles-table";
import { CsvInfoDialog } from "./csv-info-dialog";
import { DeleteAllArticlesButton } from "./delete-all-articles-button";

export default async function ArticlesPage() {
    const products = await getProducts();

    return (
        <div className="grid flex-1 items-start gap-4 lg:gap-8">
            <PageHeader
                title="Maestro de Artículos"
                description="Gestionar los artículos habilitados para el escaneo en el sistema."
            >
                <div className="flex items-center gap-2">
                    <CsvUpload />
                    <CsvInfoDialog />
                    <DeleteAllArticlesButton disabled={products.length === 0} />
                </div>
            </PageHeader>

            <ArticlesTable data={products} />
        </div>
    );
}
