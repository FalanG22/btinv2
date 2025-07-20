"use client";

import { ScannedArticle } from "@/lib/data";
import { format } from "date-fns";
import { ReactNode, useRef } from "react";

type PrintLabelProps = {
  article: ScannedArticle;
  children: ReactNode;
};

export function PrintLabel({ article, children }: PrintLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow && labelRef.current) {
        printWindow.document.write('<html><head><title>Print Label</title>');
        printWindow.document.write('<style> body { font-family: sans-serif; margin: 20px; } .label { border: 2px solid black; padding: 15px; } h3 { margin: 0 0 10px; } p { margin: 4px 0; } .ean { font-family: monospace; font-size: 1.2em; text-align: center; padding: 10px; border-top: 1px solid #ccc; margin-top: 10px; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(labelRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  return (
    <>
      <div onClick={handlePrint}>{children}</div>
      <div className="hidden">
        <div ref={labelRef} className="label">
          <h3>Product Label</h3>
          <p><strong>Zone:</strong> {article.zoneName}</p>
          <p><strong>Scanned at:</strong> {format(new Date(article.scannedAt), "dd/MM/yyyy HH:mm")}</p>
          <p><strong>User:</strong> {article.userId}</p>
          <div className="ean">{article.ean}</div>
        </div>
      </div>
    </>
  );
}
