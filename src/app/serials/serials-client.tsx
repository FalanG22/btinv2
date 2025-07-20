"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addScan } from "@/lib/actions";
import type { Zone } from "@/lib/data";
import { scanSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, ScanLine, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import PageHeader from "@/components/page-header";

type Step = 'zone' | 'scan';

export default function SerialsClient({ zones }: { zones: Zone[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState<Step>('zone');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      ean: "",
      zoneId: "",
      countNumber: 0, // Not used for serials, but schema requires it
    },
  });

  useEffect(() => {
    if (selectedZone) {
      form.setValue("zoneId", selectedZone.id);
    }
  }, [selectedZone, form]);


  const onSubmit = (values: z.infer<typeof scanSchema>) => {
    const serial = values.ean;
    if (scannedSerials.includes(serial)) {
        toast({
            title: "Serial Duplicado",
            description: "Este número de serie ya ha sido escaneado en esta sesión.",
            variant: "destructive"
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: 0 });
        return;
    }

    startTransition(async () => {
        // Here you would typically save the serial number.
        // For this demo, we'll just add it to the local list.
        await new Promise(res => setTimeout(res, 300)); // Simulate API call

        setScannedSerials(prev => [serial, ...prev]);
        toast({
          title: "Success",
          description: `Número de serie ${serial} registrado.`,
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: 0 });
    });
  };

  const handleZoneSelect = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setStep('scan');
    }
  };

  const handleBack = () => {
    setStep('zone');
    setSelectedZone(null);
    setScannedSerials([]);
    form.reset({ ean: "", zoneId: "", countNumber: 0 });
  };
  
  const zoneOptions = zones.map(zone => ({ label: zone.name, value: zone.id }));

  const currentTitle = useMemo(() => {
    if (step === 'zone') return 'Seleccionar Zona para Series';
    if (step === 'scan') return `Escaneo de Series - Zona: ${selectedZone?.name}`;
    return 'Scan';
  }, [step, selectedZone]);

  return (
    <div className="grid flex-1 items-start gap-4">
      <PageHeader title={currentTitle}>
        {step !== 'zone' && (
           <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
        )}
      </PageHeader>

      {step === 'zone' && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Zona de Escaneo</CardTitle>
            <CardDescription>Elige la zona donde escanearás los números de serie.</CardDescription>
          </CardHeader>
          <CardContent>
             <Combobox
                options={zoneOptions}
                onChange={handleZoneSelect}
                placeholder="Selecciona una zona"
                searchPlaceholder="Buscar zonas..."
                emptyText="No se encontraron zonas."
              />
          </CardContent>
        </Card>
      )}


      {step === 'scan' && (
        <div className="grid auto-rows-max items-start gap-4 lg:grid-cols-2 lg:gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Escanear Número de Serie</CardTitle>
              <CardDescription>Ingresa un número de serie para registrarlo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ean"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Serie</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SN123456789" {...field} autoFocus />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="zoneId" render={() => <FormItem />} />
                   <FormField control={form.control} name="countNumber" render={() => <FormItem />} />

                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ScanLine className="mr-2 h-4 w-4" />
                        <span>Record Scan ({scannedSerials.length})</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Series Escaneadas</CardTitle>
              <CardDescription>Números de serie escaneados en esta sesión.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Serie</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scannedSerials.length > 0 ? (
                    scannedSerials.map(serial => (
                      <TableRow key={serial}>
                        <TableCell className="font-medium">{serial}</TableCell>
                        <TableCell>{isClient ? format(new Date(), "HH:mm:ss") : '...'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">No hay series escaneadas.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
