
"use client";

import type { Product } from "@/lib/data";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ITEMS_PER_PAGE = 10;

export function ArticlesTable({ data }: { data: Product[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Artículos Habilitados</CardTitle>
          <CardDescription>Un listado de todos los artículos importados y disponibles para escanear.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código (EAN/Serie)</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((product) => (
                  <TableRow key={product.code}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron artículos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-6">
                <div className="text-xs text-muted-foreground">
                    Página {currentPage} de {totalPages}
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
