
"use client";

import type { SkuSummaryItem } from "@/lib/actions";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export function SkuSummaryTable({ data }: { data: SkuSummaryItem[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return data.filter((item) =>
            item.sku.toLowerCase().includes(lowercasedFilter) ||
            item.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [data, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Resumen de Cantidades por SKU</CardTitle>
                <CardDescription>Un listado de todos los SKUs y sus cantidades contadas.</CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por SKU o descripción..."
                    className="pl-8 sm:w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
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
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
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
                    {searchTerm ? "No se encontraron SKUs con ese criterio." : "No hay datos de resumen disponibles."}
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
