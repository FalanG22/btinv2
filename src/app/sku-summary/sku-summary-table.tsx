"use client";

import type { SkuSummaryItem } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function SkuSummaryTable({ data }: { data: SkuSummaryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Cantidades por SKU</CardTitle>
        <CardDescription>Un listado de todos los SKUs y sus cantidades contadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Conteo 1</TableHead>
                <TableHead className="text-center">Conteo 2</TableHead>
                <TableHead className="text-center">Conteo 3</TableHead>
                <TableHead className="text-center">Total Escaneado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.count1}</TableCell>
                    <TableCell className="text-center">{item.count2}</TableCell>
                    <TableCell className="text-center">{item.count3}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary">{item.total}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay datos de resumen disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
