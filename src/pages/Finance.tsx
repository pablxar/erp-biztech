import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const monthlyData = [
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

const expenseCategories = [
  { name: "Personal", value: 35, color: "hsl(142, 69%, 58%)" },
  { name: "Software", value: 25, color: "hsl(199, 89%, 48%)" },
  { name: "Marketing", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Operaciones", value: 15, color: "hsl(280, 65%, 60%)" },
  { name: "Otros", value: 5, color: "hsl(220, 15%, 40%)" },
];

const recentTransactions = [
  { id: 1, description: "Pago - BizTech Inc.", amount: 15000, type: "income", date: "5 Dic 2025", project: "Rediseño Web" },
  { id: 2, description: "Suscripción AWS", amount: -2500, type: "expense", date: "4 Dic 2025", category: "Software" },
  { id: 3, description: "Pago - TechStore", amount: 8500, type: "income", date: "3 Dic 2025", project: "App Móvil" },
  { id: 4, description: "Nómina Noviembre", amount: -28000, type: "expense", date: "1 Dic 2025", category: "Personal" },
  { id: 5, description: "Pago - Consulting Pro", amount: 12000, type: "income", date: "30 Nov 2025", project: "Sistema CRM" },
];

const invoices = [
  { id: "INV-001", client: "BizTech Inc.", amount: 15000, status: "paid", dueDate: "5 Dic 2025" },
  { id: "INV-002", client: "TechStore", amount: 22500, status: "pending", dueDate: "15 Dic 2025" },
  { id: "INV-003", client: "Consulting Pro", amount: 8750, status: "overdue", dueDate: "1 Dic 2025" },
  { id: "INV-004", client: "DataViz Corp", amount: 5000, status: "draft", dueDate: "20 Dic 2025" },
];

const budgets = [
  { project: "Rediseño Web BizTech", budget: 25000, spent: 18750, remaining: 6250 },
  { project: "App Móvil E-commerce", budget: 45000, spent: 20250, remaining: 24750 },
  { project: "Sistema CRM", budget: 35000, spent: 31500, remaining: 3500 },
];

const statusConfig = {
  paid: { label: "Pagada", color: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
  draft: { label: "Borrador", color: "bg-muted text-muted-foreground border-muted" },
};

export default function Finance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanzas</h1>
          <p className="text-muted-foreground mt-1">
            Control financiero y contabilidad
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-3xl font-bold">$812,000</p>
              <p className="text-sm text-success flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +18.2% vs año anterior
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Gastos Totales</p>
              <p className="text-3xl font-bold">$475,000</p>
              <p className="text-sm text-destructive flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                +8.5% vs año anterior
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Margen Neto</p>
              <p className="text-3xl font-bold">$337,000</p>
              <p className="text-sm text-success flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                41.5% margen
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Por Cobrar</p>
              <p className="text-3xl font-bold">$51,250</p>
              <p className="text-sm text-warning">4 facturas pendientes</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <Receipt className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Flujo de Caja</h3>
              <p className="text-sm text-muted-foreground">Comparativa mensual 2025</p>
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
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIngresos2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 15%, 10%)", border: "1px solid hsl(220, 15%, 15%)", borderRadius: "8px", color: "white" }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(142, 69%, 58%)" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos2)" />
                <Area type="monotone" dataKey="gastos" stroke="hsl(0, 72%, 51%)" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-6">Distribución de Gastos</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 15%, 10%)", border: "1px solid hsl(220, 15%, 15%)", borderRadius: "8px", color: "white" }} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {expenseCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", tx.type === "income" ? "bg-success/10" : "bg-destructive/10")}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <span className={cn("font-semibold", tx.type === "income" ? "text-success" : "text-destructive")}>
                  {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString("es-MX", { style: "currency", currency: "USD" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Facturas</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{inv.id}</p>
                    <Badge className={cn("text-xs border", statusConfig[inv.status as keyof typeof statusConfig].color)}>
                      {statusConfig[inv.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{inv.client} • Vence: {inv.dueDate}</p>
                </div>
                <span className="font-semibold">${inv.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Tracking */}
      <div className="glass rounded-xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold mb-6">Presupuestos por Proyecto</h3>
        <div className="space-y-6">
          {budgets.map((budget) => (
            <div key={budget.project} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{budget.project}</span>
                <span className="text-sm text-muted-foreground">
                  ${budget.spent.toLocaleString()} / ${budget.budget.toLocaleString()}
                </span>
              </div>
              <Progress value={(budget.spent / budget.budget) * 100} className={cn("h-2", budget.spent / budget.budget > 0.9 && "[&>div]:bg-warning")} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Gastado: {((budget.spent / budget.budget) * 100).toFixed(0)}%</span>
                <span className={cn(budget.remaining < 5000 ? "text-warning" : "text-success")}>
                  Restante: ${budget.remaining.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
