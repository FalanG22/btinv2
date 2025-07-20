
"use client";

import type { Product } from "@/lib/data";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, ScanLine } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export function ArticlesTable({ data }: { data: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return data.filter((product) =>
      product.code.toLowerCase().includes(lowercasedFilter) ||
      product.sku.toLowerCase().includes(lowercasedFilter) ||
      product.description.toLowerCase().includes(lowercasedFilter)
    );
  }, [data, searchTerm]);
  
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
      // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, totalPages]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const isEan = (code: string) => {
    return code.startsWith('779') && code.length === 13;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Artículos Habilitados</CardTitle>
                <CardDescription>Un listado de todos los artículos importados y disponibles para escanear.</CardDescription>
            </div>
             <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por código, SKU..."
                    className="pl-8 sm:w-full"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código (EAN/Serie)</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((product) => (
                  <TableRow key={product.code}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>
                      {isEan(product.code) ? (
                        <Badge variant="outline" className="gap-1 pl-2 pr-3">
                            <ScanLine className="h-3 w-3" /> EAN
                         </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 pl-2 pr-3">
                            <Hash className="h-3 w-3" /> Serie
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                     {searchTerm ? "No se encontraron artículos con ese criterio." : "No se encontraron artículos."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-6">
                <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{paginatedData.length}</strong> de <strong>{filteredData.length}</strong> artículos
                </div>
                <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    >
                    Anterior
                    </Button>
                     <span className="text-sm font-medium">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    >
                    Siguiente
                    </Button>
                </div>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
