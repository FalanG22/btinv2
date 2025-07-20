
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import PageHeader from "@/components/page-header";
import { getDashboardStats } from "@/lib/actions";
import { ScanLine, Hash, MapPin, List } from "lucide-react";
import { useEffect, useState } from "react";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const chartConfig = {
    count1: {
      label: "Conteo 1",
      color: "hsl(var(--primary))",
    },
    count2: {
      label: "Conteo 2",
      color: "hsl(var(--accent))",
    },
    count3: {
      label: "Conteo 3",
      color: "hsl(var(--secondary))",
    },
  } satisfies ChartConfig;

  if (!stats) {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
             <PageHeader
                title="Panel de Control"
                description="Un resumen de tu actividad de escaneo."
            />
            <div className="grid place-items-center h-96">
                <p>Cargando estadísticas...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <PageHeader
        title="Panel de Control"
        description="Un resumen de tu actividad de escaneo."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos EAN (Hoy)</CardTitle>
            <ScanLine className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eanScansToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-green-500 to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos Series (Hoy)</CardTitle>
            <Hash className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seriesScansToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-orange-500 to-orange-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zonas Activas</CardTitle>
            <MapPin className="h-4 w-4 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeZones}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-purple-500 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escaneos</CardTitle>
            <List className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Escaneos por Zona y Conteo</CardTitle>
             <CardDescription>Comparación de unidades escaneadas para cada conteo dentro de las zonas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart
                accessibilityLayer
                data={stats.chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                 />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar
                  dataKey="count1"
                  fill="var(--color-count1)"
                  radius={[4, 4, 0, 0]}
                />
                 <Bar
                  dataKey="count2"
                  fill="var(--color-count2)"
                  radius={[4, 4, 0, 0]}
                />
                 <Bar
                  dataKey="count3"
                  fill="var(--color-count3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
