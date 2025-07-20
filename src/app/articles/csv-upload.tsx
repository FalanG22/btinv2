"use client";

import { useRef, useTransition } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { addProductsFromCsv } from "@/lib/actions";
import { Product } from "@/lib/data";

type CsvProduct = Omit<Product, 'code'> & { code: string | number };

export function CsvUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    startTransition(() => {
        Papa.parse<CsvProduct>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const products: Product[] = results.data.map(item => ({
                    ...item,
                    code: String(item.code)
                }));
                
                const result = await addProductsFromCsv(products);

                if (result.error) {
                    toast({
                        variant: "destructive",
                        title: "Error al Importar CSV",
                        description: result.error,
                    });
                } else {
                    toast({
                        title: "Importación Exitosa",
                        description: result.success,
                    });
                }
            },
            error: (error) => {
                toast({
                    variant: "destructive",
                    title: "Error al leer el archivo",
                    description: error.message,
                });
            },
        });
    });

    // Reset the input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
        disabled={isPending}
      />
      <Button size="sm" variant="outline" className="gap-1" onClick={handleClick} disabled={isPending}>
        {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
            <Upload className="h-3.5 w-3.5" />
        )}
        {isPending ? "Importando..." : "Subir CSV"}
      </Button>
    </>
  );
}
