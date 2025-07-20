"use client";

import type { CountsReportItem } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";


export function CountsReportTable({ data }: { data: CountsReportItem[] }) {
    
    const CountCell = ({ user }: { user: string | null }) => (
        <TableCell>
            {user ? (
                <Badge variant="secondary" className="gap-1.5 pl-2 pr-3">
                    <UserCheck className="h-3.5 w-3.5 text-green-600" />
                    {user}
                </Badge>
            ) : (
                <Badge variant="outline" className="gap-1.5 pl-2 pr-3 text-muted-foreground">
                    <UserX className="h-3.5 w-3.5" />
                    N/A
                </Badge>
            )}
        </TableCell>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Counts Report</CardTitle>
        <CardDescription>A list of all articles and who performed each count.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article Code</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Count 1 By</TableHead>
              <TableHead>Count 2 By</TableHead>
              <TableHead>Count 3 By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">{item.ean}</TableCell>
                  <TableCell>{item.zoneName}</TableCell>
                  <CountCell user={item.count1_user} />
                  <CountCell user={item.count2_user} />
                  <CountCell user={item.count3_user} />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No report data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
