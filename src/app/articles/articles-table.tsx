"use client";

import { useTransition, useState, useEffect } from "react";
import { deleteScan } from "@/lib/actions";
import type { ScannedArticle } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Printer, Trash2 } from "lucide-react";
import { PrintLabel } from "./print-label";
import { Badge } from "@/components/ui/badge";

export function ArticlesTable({ data }: { data: ScannedArticle[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (scanId: string) => {
    startTransition(async () => {
      const result = await deleteScan(scanId);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: result.success });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scanned Articles</CardTitle>
          <CardDescription>A list of all article scan records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EAN</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Count</TableHead>
                <TableHead className="hidden md:table-cell">Scanned By</TableHead>
                <TableHead className="hidden md:table-cell">Scanned At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.ean}</TableCell>
                    <TableCell>{article.zoneName}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">C{article.countNumber}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{article.userId}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isClient ? format(new Date(article.scannedAt), "MMMM d, yyyy 'at' HH:mm") : '...'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <PrintLabel article={article}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Label
                                </DropdownMenuItem>
                            </PrintLabel>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this scan record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.id)}
                              disabled={isPending}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
