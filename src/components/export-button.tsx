
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
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
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      toast({
        title: "Exportación Exitosa",
        description: `El archivo ${filename}.xlsx se ha descargado.`,
      });

    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      toast({
        variant: "destructive",
        title: "Error de Exportación",
        description: "No se pudo generar el archivo XLSX.",
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
        {isExporting ? "Exportando..." : "Exportar XLSX"}
      </span>
       <span className="inline sm:hidden">
        {isExporting ? "..." : "Exportar"}
      </span>
    </Button>
  );
}
