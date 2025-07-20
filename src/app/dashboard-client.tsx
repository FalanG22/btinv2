"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addScan } from "@/lib/actions";
import type { ScannedArticle, Zone } from "@/lib/data";
import { scanSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, ScanLine } from "lucide-react";
import { format } from 'date-fns';

type DashboardClientProps = {
  zones: Zone[];
  initialRecentScans: ScannedArticle[];
};

export default function DashboardClient({ zones, initialRecentScans }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [recentScans, setRecentScans] = useState<ScannedArticle[]>(initialRecentScans);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      ean: "",
      zoneId: zones[0]?.id || "",
    },
  });

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
        form.reset();
      }
    });
  };

  const zoneOptions = zones.map(zone => ({ label: zone.name, value: zone.id }));

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:grid-cols-2 lg:gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Scan Article</CardTitle>
            <CardDescription>Enter an EAN code and select the zone to record a scan.</CardDescription>
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
                <FormField
                  control={form.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scanning Zone</FormLabel>
                       <Combobox
                          options={zoneOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select a zone"
                          searchPlaceholder="Search zones..."
                          emptyText="No zones found."
                        />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>A list of the most recently scanned articles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EAN</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScans.length > 0 ? (
                  recentScans.map(scan => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium">{scan.ean}</TableCell>
                      <TableCell>{scan.zoneName}</TableCell>
                      <TableCell>{isClient ? format(new Date(scan.scannedAt), "HH:mm:ss") : '...'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No recent scans.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
