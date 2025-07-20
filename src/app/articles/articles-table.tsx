"use client";

import type { Product } from "@/lib/data";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ArticlesTable({ data }: { data: Product[] }) {
  
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
              {data.length > 0 ? (
                data.map((product) => (
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
      </Card>
    </>
  );
}
