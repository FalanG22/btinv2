"use client";

import { useTransition, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addZonesBatch } from "@/lib/actions";
import { zoneBuilderSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Wand2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ZoneBuilderValues = z.infer<typeof zoneBuilderSchema>;

export function ZoneBuilderDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ZoneBuilderValues>({
    resolver: zodResolver(zoneBuilderSchema),
    defaultValues: {
      streetPrefix: 'C',
      streetFrom: 1,
      streetTo: 5,
      rackPrefix: 'E',
      rackFrom: 1,
      rackTo: 4,
    },
  });

  const watch = form.watch();

  const previewZones = useMemo(() => {
    const { streetPrefix, streetFrom, streetTo, rackPrefix, rackFrom, rackTo } = watch;
    const isValid = streetFrom > 0 && streetTo >= streetFrom && rackFrom > 0 && rackTo >= rackFrom;
    
    if (!isValid) return [];
    
    const zones = [];
    for (let s = streetFrom; s <= streetTo; s++) {
      for (let r = rackFrom; r <= rackTo; r++) {
        const street = s.toString().padStart(2, '0');
        const rack = r.toString().padStart(2, '0');
        zones.push(`${streetPrefix}${street}-${rackPrefix}${rack}`);
      }
    }
    return zones;
  }, [watch]);

  const onSubmit = (values: ZoneBuilderValues) => {
    startTransition(async () => {
      const result = await addZonesBatch(values);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: result.success });
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Add Zones
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Zone Builder</DialogTitle>
          <DialogDescription>
            Quickly generate multiple zones based on a street and rack layout.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
            
            <div className="col-span-1 space-y-4">
              <FormField
                control={form.control}
                name="streetPrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="streetFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="streetTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="rackPrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., E or R" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="rackFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="rackTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="col-span-1 space-y-2">
                <FormLabel>Preview ({previewZones.length} zones)</FormLabel>
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                    {previewZones.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                            {previewZones.map(zoneName => (
                                <Badge key={zoneName} variant="secondary">{zoneName}</Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">Adjust ranges to see a preview.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            <DialogFooter className="col-span-2 mt-4">
                <Button type="submit" disabled={isPending || previewZones.length === 0}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Zones
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
