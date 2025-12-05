import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Ene", ingresos: 45000, gastos: 28000 },
  { month: "Feb", ingresos: 52000, gastos: 32000 },
  { month: "Mar", ingresos: 48000, gastos: 29000 },
  { month: "Abr", ingresos: 61000, gastos: 35000 },
  { month: "May", ingresos: 55000, gastos: 31000 },
  { month: "Jun", ingresos: 67000, gastos: 38000 },
  { month: "Jul", ingresos: 72000, gastos: 42000 },
  { month: "Ago", ingresos: 69000, gastos: 40000 },
  { month: "Sep", ingresos: 78000, gastos: 45000 },
  { month: "Oct", ingresos: 82000, gastos: 48000 },
  { month: "Nov", ingresos: 88000, gastos: 52000 },
  { month: "Dic", ingresos: 95000, gastos: 55000 },
];

export function RevenueChart() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Flujo Financiero</h3>
          <p className="text-sm text-muted-foreground">Ingresos vs Gastos 2025</p>
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
