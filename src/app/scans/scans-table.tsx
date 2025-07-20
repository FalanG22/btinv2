
"use client";

import { useTransition, useState, useEffect } from "react";
import { deleteScanByEan } from "@/lib/actions";
import type { ScannedArticle } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Printer, Trash2, Hash, ScanLine } from "lucide-react";
import { PrintLabel } from "./print-label";
import { Badge } from "@/components/ui/badge";

export type GroupedScan = {
  ean: string;
  sku: string;
  description: string;
  isSerial: boolean;
  zoneName: string;
  countNumber: number;
  lastScannedAt: string;
  quantity: number;
};

export function ScansTable({ data }: { data: GroupedScan[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (ean: string) => {
    startTransition(async () => {
      const result = await deleteScanByEan(ean);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: result.success });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Escaneos</CardTitle>
          <CardDescription>Un listado agrupado de todos los registros de escaneo de artículos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código (EAN/Serie)</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead>Zona (última)</TableHead>
                <TableHead>Conteo (último)</TableHead>
                <TableHead className="hidden md:table-cell">Último Escaneo</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.ean}>
                    <TableCell className="font-medium">{item.ean}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.isSerial ? (
                        <Badge variant="outline" className="gap-1 pl-2 pr-3">
                            <Hash className="h-3 w-3" /> Serie
                        </Badge>
                      ) : (
                         <Badge variant="outline" className="gap-1 pl-2 pr-3">
                            <ScanLine className="h-3 w-3" /> EAN
                         </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.quantity > 1 ? "default" : "secondary"}>
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.zoneName}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">C{item.countNumber}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isClient ? format(new Date(item.lastScannedAt), "d MMM, yyyy HH:mm") : '...'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente los {item.quantity} registros de escaneo para el código "{item.ean}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.ean)}
                              disabled={isPending}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No se encontraron escaneos.
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
