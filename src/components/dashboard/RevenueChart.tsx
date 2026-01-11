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
import { TrendingUp, TrendingDown } from "lucide-react";

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function RevenueChart() {
  const { data: transactions, isLoading } = useTransactions();

  const { chartData, totalIncome, totalExpenses } = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    if (!transactions) return { 
      chartData: months.map(month => ({ month, ingresos: 0, gastos: 0 })),
      totalIncome: 0,
      totalExpenses: 0
    };

    const currentYear = new Date().getFullYear();
    const monthlyData: Record<number, { ingresos: number; gastos: number }> = {};

    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { ingresos: 0, gastos: 0 };
    }

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (tx.type === 'income') {
          monthlyData[month].ingresos += Number(tx.amount);
          totalIncome += Number(tx.amount);
        } else {
          monthlyData[month].gastos += Number(tx.amount);
          totalExpenses += Number(tx.amount);
        }
      }
    });

    return {
      chartData: months.map((month, i) => ({
        month,
        ingresos: monthlyData[i].ingresos,
        gastos: monthlyData[i].gastos,
      })),
      totalIncome,
      totalExpenses
    };
  }, [transactions]);

  const balance = totalIncome - totalExpenses;
  const isPositive = balance >= 0;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Flujo Financiero</h3>
            <p className="text-sm text-muted-foreground">
              Análisis de ingresos y gastos {new Date().getFullYear()}
            </p>
          </div>
          
          {/* Stats Summary */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-sm font-semibold text-emerald-400">${totalIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="text-sm font-semibold text-red-400">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
              isPositive 
                ? 'bg-primary/10 border-primary/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className={`text-sm font-semibold ${isPositive ? 'text-primary' : 'text-red-400'}`}>
                  ${Math.abs(balance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="hsl(220, 10%, 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(220, 10%, 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 15%, 10%)",
                  border: "1px solid hsl(220, 15%, 20%)",
                  borderRadius: "12px",
                  color: "white",
                  padding: "12px 16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "hsl(220, 10%, 55%)", marginBottom: "8px" }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'ingresos' ? 'Ingresos' : 'Gastos'
                ]}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="hsl(142, 69%, 58%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIngresos)"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="hsl(0, 72%, 51%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGastos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
