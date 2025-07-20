
"use client";

import type { CountsReportItem } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, AlertTriangle } from "lucide-react";


export function CountsReportTable({ data }: { data: CountsReportItem[] }) {
    
    const CountCell = ({ user, zone }: { user: string | null, zone: string | null }) => (
        <TableCell>
            {user ? (
                <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="gap-1.5 pl-2 pr-3 w-fit">
                        <UserCheck className="h-3.5 w-3.5 text-green-600" />
                        {user}
                    </Badge>
                     <span className="text-xs text-muted-foreground pl-2">{zone}</span>
                </div>
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
        <div className="overflow-x-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Article Code</TableHead>
                <TableHead>Count 1 (User / Zone)</TableHead>
                <TableHead>Count 2 (User / Zone)</TableHead>
                <TableHead>Count 3 (User / Zone)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => {
                    const needsThirdCount = 
                        item.count1_zone &&
                        item.count2_zone &&
                        item.count1_zone !== item.count2_zone;

                    return (
                        <TableRow key={item.key}>
                            <TableCell className="font-medium">{item.ean}</TableCell>
                            <CountCell user={item.count1_user} zone={item.count1_zone} />
                            <CountCell user={item.count2_user} zone={item.count2_zone} />
                            <CountCell user={item.count3_user} zone={item.count3_zone} />
                            <TableCell>
                                {needsThirdCount ? (
                                    <Badge variant="destructive" className="gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Third Count Needed
                                    </Badge>
                                ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No report data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
