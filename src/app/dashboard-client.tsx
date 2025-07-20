"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addScan, getRecentScans } from "@/lib/actions";
import type { ScannedArticle, Zone } from "@/lib/data";
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

type DashboardClientProps = {
  zones: Zone[];
};

type Step = 'zone' | 'count' | 'scan';

export default function DashboardClient({ zones }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [recentScans, setRecentScans] = useState<ScannedArticle[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState<Step>('zone');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      ean: "",
      zoneId: "",
      countNumber: undefined,
    },
  });

  useEffect(() => {
    if (selectedZone) {
      form.setValue("zoneId", selectedZone.id);
    }
    if (selectedCount) {
      form.setValue("countNumber", selectedCount);
    }
  }, [selectedZone, selectedCount, form]);

  useEffect(() => {
    if (step === 'scan' && selectedZone && selectedCount) {
        startTransition(async () => {
            const scans = await getRecentScans(selectedZone.id, selectedCount, 5);
            setRecentScans(scans);
        });
    }
  }, [step, selectedZone, selectedCount]);

  const onSubmit = (values: z.infer<typeof scanSchema>) => {
    startTransition(async () => {
      const result = await addScan(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: result.success,
        });
        if (result.newScan) {
            setRecentScans(prev => [result.newScan!, ...prev].slice(0, 5));
        }
        form.reset({ ean: "", zoneId: selectedZone?.id, countNumber: selectedCount });
      }
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
      setStep('count');
      setSelectedCount(null);
      setRecentScans([]);
    } else if (step === 'count') {
      setStep('zone');
      setSelectedZone(null);
    }
  };
  
  const zoneOptions = zones.map(zone => ({ label: zone.name, value: zone.id }));

  const currentTitle = useMemo(() => {
    if (step === 'zone') return 'Select a Zone';
    if (step === 'count') return `Zone: ${selectedZone?.name}`;
    if (step === 'scan') return `Zone: ${selectedZone?.name} - Conteo ${selectedCount}`;
    return 'Scan';
  }, [step, selectedZone, selectedCount]);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <PageHeader title={currentTitle}>
        {step !== 'zone' && (
           <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        )}
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
              <CardTitle>Scan Article</CardTitle>
              <CardDescription>Enter an EAN code to record a scan.</CardDescription>
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
                          <Input placeholder="e.g., 8412345678901" {...field} />
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
                    Record Scan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Scans (Conteo {selectedCount})</CardTitle>
              <CardDescription>Most recently scanned articles in this session.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EAN</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans.length > 0 ? (
                    recentScans.map(scan => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">{scan.ean}</TableCell>
                        <TableCell>{isClient ? format(new Date(scan.scannedAt), "HH:mm:ss") : '...'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">No recent scans.</TableCell>
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
