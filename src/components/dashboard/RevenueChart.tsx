import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function RevenueChart() {
  const { data: transactions, isLoading } = useTransactions();

  const chartData = useMemo(() => {
    if (!transactions) return months.map(month => ({ month, ingresos: 0, gastos: 0 }));

    const currentYear = new Date().getFullYear();
    const monthlyData: Record<number, { ingresos: number; gastos: number }> = {};

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { ingresos: 0, gastos: 0 };
    }

    // Aggregate transactions
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (tx.type === 'income') {
          monthlyData[month].ingresos += Number(tx.amount);
        } else {
          monthlyData[month].gastos += Number(tx.amount);
        }
      }
    });

    return months.map((month, i) => ({
      month,
      ingresos: monthlyData[i].ingresos,
      gastos: monthlyData[i].gastos,
    }));
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Flujo Financiero</h3>
            <p className="text-sm text-muted-foreground">Ingresos vs Gastos 2025</p>
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Flujo Financiero</h3>
          <p className="text-sm text-muted-foreground">Ingresos vs Gastos {new Date().getFullYear()}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="text-muted-foreground">Gastos</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 15%, 10%)",
                border: "1px solid hsl(220, 15%, 15%)",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="hsl(142, 69%, 58%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIngresos)"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGastos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
