
"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addScansBatch, validateEan } from "@/lib/actions";
import type { ScannedArticle, Zone } from "@/lib/data";
import { scanSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, ScanLine, ArrowLeft, UploadCloud, Trash2, Trash, Minus } from "lucide-react";
import { format } from 'date-fns';
import PageHeader from "@/components/page-header";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


type DashboardClientProps = {
  zones: Zone[];
};

type Step = 'zone' | 'count' | 'scan';

type StagedScan = {
  ean: string;
  scannedAt: string;
  zoneId: string;
  countNumber: number;
};

type GroupedScan = {
    ean: string;
    quantity: number;
    lastScannedAt: string;
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


export default function DashboardClient({ zones }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isFinalizing, startFinalizing] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState<Step>('zone');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [stagedScans, setStagedScans] = useState<StagedScan[]>([]);
  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails>(null);

  const getStorageKey = useCallback(() => {
    if (!selectedZone || !selectedCount) return null;
    return `stagedScans_${selectedZone.id}_${selectedCount}`;
  }, [selectedZone, selectedCount]);

  useEffect(() => {
    setIsClient(true);
    const key = getStorageKey();
    if (key) {
      const savedScans = localStorage.getItem(key);
      if (savedScans) {
        setStagedScans(JSON.parse(savedScans));
      } else {
        setStagedScans([]);
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
    startTransition(async () => {
      // 1. Validate if EAN exists in master products
      const { exists } = await validateEan(values.ean);
      if (!exists) {
        playErrorSound();
        toast({
          title: "EAN no Encontrado",
          description: `El código "${values.ean}" no existe en el maestro de artículos.`,
          variant: "destructive",
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount ?? undefined });
        return;
      }

      // 2. If valid, add to staged scans
      const newScan: StagedScan = {
          ean: values.ean,
          scannedAt: new Date().toISOString(),
          zoneId: values.zoneId,
          countNumber: values.countNumber,
      };
      const updatedScans = [...stagedScans, newScan];
      setStagedScans(updatedScans);

      const key = getStorageKey();
      if(key) {
          localStorage.setItem(key, JSON.stringify(updatedScans));
      }

      toast({
        title: "Escaneo añadido",
        description: `EAN ${values.ean} preparado para la carga.`,
      });
      form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount });
    });
  };

  const groupedStagedScans = useMemo(() => {
    return stagedScans.reduce((acc, scan) => {
        const existing = acc.find(s => s.ean === scan.ean);
        if (existing) {
            existing.quantity++;
            existing.lastScannedAt = scan.scannedAt;
        } else {
            acc.push({
                ean: scan.ean,
                quantity: 1,
                lastScannedAt: scan.scannedAt
            });
        }
        return acc;
    }, [] as GroupedScan[]).sort((a,b) => new Date(b.lastScannedAt).getTime() - new Date(a.lastScannedAt).getTime());
  }, [stagedScans]);

  const resetFlow = () => {
      setSelectedZone(null);
      setSelectedCount(null);
      setStagedScans([]);
      form.reset({ ean: "", zoneId: "", countNumber: undefined });
      setSubmissionDetails(null);
      setStep('zone');
  }

  const handleFinalize = () => {
    if (stagedScans.length === 0) {
        toast({ title: "Sin escaneos", description: "No hay escaneos para cargar.", variant: "destructive" });
        return;
    }

    if (isClient && !navigator.onLine) {
        toast({
            title: "Estás desconectado",
            description: "Los escaneos se han guardado. Se cargarán cuando vuelvas a tener conexión.",
            variant: "destructive"
        });
        resetFlow();
        return;
    }

    startFinalizing(async () => {
        const result = await addScansBatch(stagedScans);
         if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            setSubmissionDetails({
                zoneName: selectedZone?.name || 'Desconocida',
                countNumber: selectedCount || 0,
                quantity: stagedScans.length,
            });
            const key = getStorageKey();
            if (key) {
                localStorage.removeItem(key);
            }
        }
    });
  }
  
  const handleDecrementStagedScan = (eanToDecrement: string) => {
    const updatedScans = [...stagedScans];
    const lastIndex = updatedScans.map(s => s.ean).lastIndexOf(eanToDecrement);
    
    if (lastIndex > -1) {
        updatedScans.splice(lastIndex, 1);
        setStagedScans(updatedScans);
        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(updatedScans));
        }
        toast({
            title: "Cantidad reducida",
            description: `Se ha reducido en uno la cantidad para el EAN ${eanToDecrement}.`,
        });
    }
  };

  const handleDeleteStagedScan = (eanToDelete: string) => {
    const updatedScans = stagedScans.filter((scan) => scan.ean !== eanToDelete);
    setStagedScans(updatedScans);
    const key = getStorageKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(updatedScans));
    }
    toast({
        title: "Escaneos eliminados",
        description: `Todos los escaneos para el EAN ${eanToDelete} han sido eliminados de la cola.`,
    });
  };
  
  const handleDeleteAllStagedScans = () => {
      const key = getStorageKey();
      if (key) {
          localStorage.removeItem(key);
      }
      setStagedScans([]);
      toast({
          title: "Cola vaciada",
          description: "Todos los escaneos preparados para esta sesión han sido eliminados.",
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
    if (step === 'zone') return 'Escaneo EAN: Seleccionar Zona';
    if (step === 'count') return `EAN - Zona: ${selectedZone?.name}`;
    if (step === 'scan') return `EAN - Zona: ${selectedZone?.name} - Conteo ${selectedCount}`;
    return 'Escanear';
  }, [step, selectedZone, selectedCount]);

  return (
    <TooltipProvider>
    <div className="grid flex-1 items-start gap-4 lg:gap-8">
      <PageHeader title={currentTitle}>
        <div className="flex items-center gap-2">
            {step === 'scan' && (
                <>
                    <Button onClick={handleFinalize} disabled={isFinalizing || stagedScans.length === 0}>
                        {isFinalizing ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                        Finalizar y Subir ({stagedScans.length})
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" disabled={stagedScans.length === 0}>
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Eliminar Todo</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminarán permanentemente los {stagedScans.length} escaneos preparados para esta sesión.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAllStagedScans} className="bg-destructive hover:bg-destructive/90">
                                    Eliminar Todo
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                </>
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
            <CardDescription>Elige la zona donde escanearás los artículos.</CardDescription>
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
              <CardTitle>Escanear o Ingresar Artículo</CardTitle>
              <CardDescription>Ingresa un código EAN para prepararlo para la carga. El código debe existir en el maestro de artículos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ean"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAN / Código de Barras</FormLabel>
                        <div className="flex items-start gap-2">
                           <FormControl>
                            <Input placeholder="ej., 8412345678901" {...field} autoFocus />
                          </FormControl>
                          <Button type="submit" disabled={isPending} size="icon" className="shrink-0">
                            {isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ScanLine className="h-5 w-5" />
                            )}
                            <span className="sr-only">Añadir Código</span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="zoneId" render={() => <FormItem />} />
                   <FormField control={form.control} name="countNumber" render={() => <FormItem />} />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escaneos Preparados (Conteo {selectedCount})</CardTitle>
              <CardDescription>Artículos esperando para ser cargados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EAN</TableHead>
                    <TableHead>Hora (último)</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedStagedScans.length > 0 ? (
                    groupedStagedScans.map((scan) => (
                      <TableRow key={scan.ean}>
                        <TableCell className="font-medium">{scan.ean}</TableCell>
                        <TableCell>{isClient ? format(new Date(scan.lastScannedAt), "HH:mm:ss") : '...'}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant="secondary">{scan.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDecrementStagedScan(scan.ean)} disabled={scan.quantity <= 0}>
                                    <Minus className="h-4 w-4" />
                                    <span className="sr-only">Disminuir uno</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Disminuir uno</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStagedScan(scan.ean)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Eliminar línea</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar línea</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No hay escaneos preparados.</TableCell>
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
            <AlertDialogTitle>Carga Exitosa</AlertDialogTitle>
            <AlertDialogDescription asChild>
                <div>
                  Los siguientes datos han sido cargados exitosamente:
                  <ul className="mt-2 list-disc list-inside">
                      <li><strong>Zona:</strong> {submissionDetails?.zoneName}</li>
                      <li><strong>Conteo:</strong> {submissionDetails?.countNumber}</li>
                      <li><strong>Total de Artículos:</strong> {submissionDetails?.quantity}</li>
                  </ul>
                </div>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={resetFlow}>Aceptar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </TooltipProvider>
  );
}
