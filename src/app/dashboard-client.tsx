"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addScansBatch } from "@/lib/actions";
import type { ScannedArticle, Zone } from "@/lib/data";
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

type DashboardClientProps = {
  zones: Zone[];
};

type Step = 'zone' | 'count' | 'scan';

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
  const [stagedScans, setStagedScans] = useState<Omit<ScannedArticle, 'id' | 'zoneName' | 'userId' | 'isSerial'>[]>([]);

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
    if (stagedScans.some(s => s.ean === values.ean)) {
        playErrorSound();
        toast({
            title: "EAN Duplicado",
            description: "Este EAN ya ha sido escaneado en esta sesión.",
            variant: "destructive"
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount ?? undefined });
        return;
    }

    startTransition(() => {
        const newScan = {
            ean: values.ean,
            scannedAt: new Date().toISOString(),
            zoneId: values.zoneId,
            countNumber: values.countNumber,
        };
        const updatedScans = [newScan, ...stagedScans];
        setStagedScans(updatedScans);

        const key = getStorageKey();
        if(key) {
            localStorage.setItem(key, JSON.stringify(updatedScans));
        }

        toast({
          title: "Scan Added",
          description: `EAN ${values.ean} staged for upload.`,
        });
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount });
    });
  };

  const resetFlow = () => {
      setSelectedZone(null);
      setSelectedCount(null);
      setStagedScans([]);
      form.reset({ ean: "", zoneId: "", countNumber: undefined });
      setStep('zone');
  }

  const handleFinalize = () => {
    if (stagedScans.length === 0) {
        toast({ title: "No scans", description: "There are no scans to upload.", variant: "destructive" });
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
        const result = await addScansBatch(stagedScans);
         if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Success", description: result.success });
            setStagedScans([]);
            const key = getStorageKey();
            if (key) {
                localStorage.removeItem(key);
            }
        }
    });
  }

  const handleDeleteStagedScan = (index: number) => {
    const updatedScans = stagedScans.filter((_, i) => i !== index);
    setStagedScans(updatedScans);
    const key = getStorageKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(updatedScans));
    }
    toast({
        title: "Scan Removed",
        description: "The scan has been removed from the queue.",
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
    if (step === 'zone') return 'Scan EAN: Select Zone';
    if (step === 'count') return `EAN - Zone: ${selectedZone?.name}`;
    if (step === 'scan') return `EAN - Zone: ${selectedZone?.name} - Count ${selectedCount}`;
    return 'Scan';
  }, [step, selectedZone, selectedCount]);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader title={currentTitle}>
        <div className="flex items-center gap-2">
            {step === 'scan' && (
                <Button onClick={handleFinalize} disabled={isFinalizing || stagedScans.length === 0}>
                    {isFinalizing ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                    Finalize & Upload ({stagedScans.length})
                </Button>
            )}
            {step !== 'zone' && (
               <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            )}
        </div>
      </PageHeader>

      {step === 'zone' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Scanning Zone</CardTitle>
            <CardDescription>Choose the zone where you will be scanning articles.</CardDescription>
          </CardHeader>
          <CardContent>
             <Combobox
                options={zoneOptions}
                onChange={handleZoneSelect}
                placeholder="Select a zone"
                searchPlaceholder="Search zones..."
                emptyText="No zones found."
              />
          </CardContent>
        </Card>
      )}

      {step === 'count' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Count Number</CardTitle>
            <CardDescription>Choose the count number for this scanning session.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(num => (
              <Button key={num} onClick={() => handleCountSelect(num)} className="h-24 text-2xl">
                Count {num}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 'scan' && (
        <div className="grid auto-rows-max items-start gap-4 lg:grid-cols-2 lg:gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Scan Article</CardTitle>
              <CardDescription>Enter an EAN code to stage it for upload.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ean"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAN / Barcode</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 8412345678901" {...field} autoFocus />
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
                      <ScanLine className="mr-2 h-4 w-4" />
                    )}
                    Add Scan to Queue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staged Scans (Count {selectedCount})</CardTitle>
              <CardDescription>Articles waiting to be uploaded.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EAN</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedScans.length > 0 ? (
                    stagedScans.map((scan, index) => (
                      <TableRow key={`${scan.ean}-${index}`}>
                        <TableCell className="font-medium">{scan.ean}</TableCell>
                        <TableCell>{isClient ? format(new Date(scan.scannedAt), "HH:mm:ss") : '...'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteStagedScan(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">No staged scans.</TableCell>
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
