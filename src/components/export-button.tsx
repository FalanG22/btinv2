
"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ExportButtonProps = {
  data: any[];
  filename: string;
  disabled?: boolean;
};

export function ExportButton({ data, filename, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (disabled || data.length === 0) return;

    setIsExporting(true);

    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportación Exitosa",
        description: `El archivo ${filename}.csv se ha descargado.`,
      });

    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        variant: "destructive",
        title: "Error de Exportación",
        description: "No se pudo generar el archivo CSV.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1"
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">
        {isExporting ? "Exportando..." : "Exportar CSV"}
      </span>
       <span className="inline sm:hidden">
        {isExporting ? "..." : "Exportar"}
      </span>
    </Button>
  );
}
