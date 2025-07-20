"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addSerialsBatch } from "@/lib/actions";
import type { Zone } from "@/lib/data";
import { scanSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, ScanLine, ArrowLeft, UploadCloud, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import PageHeader from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Step = 'zone' | 'count' | 'scan';

type StagedSerial = {
    serial: string;
    scannedAt: string;
}

type SubmissionDetails = {
    zoneName: string;
    countNumber: number;
    quantity: number;
} | null;

// Helper to play a sound
const playErrorSound = () => {
    if (typeof window === 'undefined') return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 pitch
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};


export default function SerialsClient({ zones }: { zones: Zone[] }) {
  const [isPending, startTransition] = useTransition();
  const [isFinalizing, startFinalizing] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState<Step>('zone');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [stagedSerials, setStagedSerials] = useState<StagedSerial[]>([]);
  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails>(null);

  const getStorageKey = useCallback(() => {
    if (!selectedZone || !selectedCount) return null;
    return `stagedSerials_${selectedZone.id}_${selectedCount}`;
  }, [selectedZone, selectedCount]);

  useEffect(() => {
    setIsClient(true);
    const key = getStorageKey();
    if (key) {
        const savedSerials = localStorage.getItem(key);
        if (savedSerials) {
            setStagedSerials(JSON.parse(savedSerials));
        } else {
            setStagedSerials([]);
        }
    }
  }, [step, selectedZone, selectedCount, getStorageKey]);

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      ean: "",
      zoneId: "",
      countNumber: undefined,
    },
  });

  useEffect(() => {
    if (selectedZone) form.setValue("zoneId", selectedZone.id);
    if (selectedCount !== null) form.setValue("countNumber", selectedCount);
  }, [selectedZone, selectedCount, form]);

  const onSubmit = (values: z.infer<typeof scanSchema>) => {
    const serial = values.ean;
    if (stagedSerials.some(s => s.serial === serial)) {
        playErrorSound();
        toast({
            title: "Serial Duplicado",
            description: "Este número de serie ya ha sido escaneado en esta sesión.",
            variant: "destructive"
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount ?? undefined });
        return;
    }

    startTransition(() => {
        const newSerial = { serial, scannedAt: new Date().toISOString() };
        const updatedSerials = [newSerial, ...stagedSerials];
        setStagedSerials(updatedSerials);
        
        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(updatedSerials));
        }

        toast({
          title: "Serial Added",
          description: `Número de serie ${serial} preparado para cargar.`,
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount ?? undefined });
    });
  };

  const resetFlow = () => {
      setSelectedZone(null);
      setSelectedCount(null);
      setStagedSerials([]);
      form.reset({ ean: "", zoneId: "", countNumber: undefined });
      setSubmissionDetails(null);
      setStep('zone');
  }

  const handleFinalize = () => {
    if (!selectedZone || selectedCount === null || stagedSerials.length === 0) {
        toast({ title: "No serials", description: "There are no serials to upload.", variant: "destructive" });
        return;
    }
    
    if (isClient && !navigator.onLine) {
        toast({
            title: "You are offline",
            description: "Scans are saved. They will be uploaded when you're back online.",
            variant: "destructive"
        });
        resetFlow();
        return;
    }

    startFinalizing(async () => {
        const serialsToUpload = stagedSerials.map(s => s.serial);
        const result = await addSerialsBatch(serialsToUpload, selectedZone.id, selectedCount);
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            setSubmissionDetails({
                zoneName: selectedZone?.name || 'Unknown',
                countNumber: selectedCount || 0,
                quantity: stagedSerials.length,
            });
            const key = getStorageKey();
            if (key) {
                localStorage.removeItem(key);
            }
        }
    });
  };

  const handleDeleteStagedSerial = (serialToDelete: string) => {
    const updatedSerials = stagedSerials.filter(s => s.serial !== serialToDelete);
    setStagedSerials(updatedSerials);
    const key = getStorageKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(updatedSerials));
    }
    toast({
        title: "Serial Removed",
        description: "The serial number has been removed from the queue.",
    });
  };

  const handleZoneSelect = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setStep('count');
    }
  };

  const handleCountSelect = (count: number) => {
    setSelectedCount(count);
    setStep('scan');
  };

  const handleBack = () => {
    if (step === 'scan') {
      setSelectedCount(null);
      form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: undefined });
      setStep('count');
    } else if (step === 'count') {
      setSelectedZone(null);
       form.reset({ ean: "", zoneId: "", countNumber: undefined });
      setStep('zone');
    }
  };
  
  const zoneOptions = zones.map(zone => ({ label: zone.name, value: zone.id }));

  const currentTitle = useMemo(() => {
    if (step === 'zone') return 'Escaneo de Series: Seleccionar Zona';
    if (step === 'count') return `Series - Zona: ${selectedZone?.name}`;
    if (step === 'scan') return `Series - Zona: ${selectedZone?.name} - Conteo ${selectedCount}`;
    return 'Scan';
  }, [step, selectedZone, selectedCount]);

  return (
    <>
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader title={currentTitle}>
        <div className="flex items-center gap-2">
          {step === 'scan' && (
            <Button onClick={handleFinalize} disabled={isFinalizing || stagedSerials.length === 0}>
                {isFinalizing ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                Finalize & Upload ({stagedSerials.length})
            </Button>
          )}
          {step !== 'zone' && (
            <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
          )}
        </div>
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

      {step === 'count' && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Número de Conteo</CardTitle>
            <CardDescription>Elige el número de conteo para esta sesión de escaneo.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(num => (
              <Button key={num} onClick={() => handleCountSelect(num)} className="h-24 text-2xl">
                Conteo {num}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 'scan' && (
        <div className="grid auto-rows-max items-start gap-4 lg:grid-cols-2 lg:gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Escanear Número de Serie</CardTitle>
              <CardDescription>Ingresa un número de serie para prepararlo para la carga.</CardDescription>
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
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                    Añadir Serie a la Cola
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Series Preparadas (Conteo {selectedCount})</CardTitle>
              <CardDescription>Números de serie esperando para ser cargados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Serie</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedSerials.length > 0 ? (
                    stagedSerials.map(item => (
                      <TableRow key={item.serial}>
                        <TableCell className="font-medium">{item.serial}</TableCell>
                        <TableCell>{isClient ? format(new Date(item.scannedAt), "HH:mm:ss") : '...'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteStagedSerial(item.serial)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">No hay series preparadas.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>

    <AlertDialog open={!!submissionDetails} onOpenChange={(open) => !open && resetFlow()}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Upload Successful</AlertDialogTitle>
            <AlertDialogDescription asChild>
                <div>
                  The following data has been uploaded successfully:
                  <ul className="mt-2 list-disc list-inside">
                      <li><strong>Zone:</strong> {submissionDetails?.zoneName}</li>
                      <li><strong>Count:</strong> {submissionDetails?.countNumber}</li>
                      <li><strong>Total Serials:</strong> {submissionDetails?.quantity}</li>
                  </ul>
                </div>
            </AlertDialogDescription>
            </AlertDialogHeader>
             <AlertDialogFooter>
                <AlertDialogAction onClick={resetFlow}>Accept</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
