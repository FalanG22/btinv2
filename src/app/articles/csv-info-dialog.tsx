"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export function CsvInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Info className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Formato CSV</span>
          <span className="inline sm:hidden">Info</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Formato de Importación de Artículos (CSV)</DialogTitle>
          <DialogDescription>
            Para importar artículos correctamente, tu archivo CSV debe seguir la siguiente estructura y formato.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-2">Columnas Requeridas:</h4>
          <p className="text-sm text-muted-foreground mb-4">
            El archivo debe contener exactamente estas tres columnas, en cualquier orden. La primera fila debe ser la cabecera con estos nombres.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de Columna</TableHead>
                <TableHead>Tipo de Dato</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="secondary">code</Badge></TableCell>
                <TableCell>Texto</TableCell>
                <TableCell>El código EAN o el Número de Serie único del producto.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="secondary">sku</Badge></TableCell>
                <TableCell>Texto</TableCell>
                <TableCell>El código de artículo (SKU) interno.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="secondary">description</Badge></TableCell>
                <TableCell>Texto</TableCell>
                <TableCell>Una breve descripción del producto.</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <h4 className="font-semibold mt-6 mb-2">Ejemplo de Archivo:</h4>
          <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
            <code>
{`code,sku,description
8412345678901,SKU-001,Caja de Tornillos 5mm
8412345678902,SKU-002,Paquete de Pilas AA
SN-ABC-001,SKU-LAP-01,Laptop Modelo X`}
            </code>
          </pre>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button>Entendido</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
