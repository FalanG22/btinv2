
"use client";

import { useState, useMemo } from "react";
import type { Zone } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";

type PrintZonesDialogProps = {
  zones: Zone[];
};

export function PrintZonesDialog({ zones }: PrintZonesDialogProps) {
  const [open, setOpen] = useState(false);
  const [fromZone, setFromZone] = useState<string | undefined>(undefined);
  const [toZone, setToZone] = useState<string | undefined>(undefined);

  const zoneOptions = useMemo(() => {
    return zones
      .slice() // Create a shallow copy before sorting
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(z => ({ label: z.name, value: z.id }));
  }, [zones]);
  
  const fromOptions = useMemo(() => {
    if (!toZone) return zoneOptions;
    const toIndex = zoneOptions.findIndex(z => z.value === toZone);
    return zoneOptions.slice(0, toIndex + 1);
  }, [zoneOptions, toZone]);

  const toOptions = useMemo(() => {
    if (!fromZone) return zoneOptions;
    const fromIndex = zoneOptions.findIndex(z => z.value === fromZone);
    return zoneOptions.slice(fromIndex);
  }, [zoneOptions, fromZone]);

  const selectedZonesCount = useMemo(() => {
    if (!fromZone || !toZone) return 0;
    const fromIndex = zoneOptions.findIndex(z => z.value === fromZone);
    const toIndex = zoneOptions.findIndex(z => z.value === toZone);
    if (fromIndex === -1 || toIndex === -1) return 0;
    return toIndex - fromIndex + 1;
  }, [fromZone, toZone, zoneOptions]);


  const handlePrint = () => {
    if (!fromZone || !toZone) return;
    
    const params = new URLSearchParams();
    params.append("from", fromZone);
    params.append("to", toZone);

    const printUrl = `/zones/print?${params.toString()}`;
    window.open(printUrl, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1" disabled={zones.length === 0}>
          <Printer className="h-3.5 w-3.5" />
          Imprimir Zonas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Imprimir Etiquetas de Zona</DialogTitle>
          <DialogDescription>
            Selecciona el rango de zonas para las cuales deseas imprimir etiquetas con código QR.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from-zone" className="text-right">
              Desde
            </Label>
            <div className="col-span-3">
              <Combobox
                value={fromZone}
                onChange={setFromZone}
                options={fromOptions}
                placeholder="Seleccionar zona inicial"
                searchPlaceholder="Buscar zona..."
                emptyText="No se encontraron zonas."
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to-zone" className="text-right">
              Hasta
            </Label>
            <div className="col-span-3">
              <Combobox
                value={toZone}
                onChange={setToZone}
                options={toOptions}
                placeholder="Seleccionar zona final"
                searchPlaceholder="Buscar zona..."
                emptyText="No se encontraron zonas."
                disabled={!fromZone}
              />
            </div>
          </div>
          {selectedZonesCount > 0 && (
             <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                    Se imprimirán <Badge variant="secondary">{selectedZonesCount}</Badge> etiquetas.
                </p>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} disabled={!fromZone || !toZone || selectedZonesCount <= 0}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
