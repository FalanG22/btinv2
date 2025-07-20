"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useRef } from "react";

export function CsvUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `"${file.name}" is ready for upload. (This is a demo)`,
      });
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
      />
      <Button size="sm" variant="outline" className="gap-1" onClick={handleClick}>
        <Upload className="h-3.5 w-3.5" />
        Upload CSV
      </Button>
    </>
  );
}
