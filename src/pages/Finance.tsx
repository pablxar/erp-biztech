import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
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
import { useTransactions, useFinancialStats } from "@/hooks/useTransactions";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { CreateTransactionDialog } from "@/components/finance/CreateTransactionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const statusConfig = {
  paid: { label: "Pagada", color: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30" },
  draft: { label: "Borrador", color: "bg-muted text-muted-foreground border-muted" },
};

export default function Finance() {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: stats, isLoading: statsLoading } = useFinancialStats();
  const { data: invoices } = useInvoices();
  const { data: projects } = useProjects();

  const isLoading = transactionsLoading || statsLoading;

  // Calculate monthly data for chart
  const chartData = useMemo(() => {
    if (!transactions) return months.map(month => ({ month, ingresos: 0, gastos: 0 }));

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

  // Calculate expense distribution
  const expenseDistribution = useMemo(() => {
    if (!transactions) return [];
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      const cat = t.category || 'Otros';
      categories[cat] = (categories[cat] || 0) + Number(t.amount);
    });

    const colors = ["hsl(142, 69%, 58%)", "hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(280, 65%, 60%)", "hsl(220, 15%, 40%)"];
    
    return Object.entries(categories)
      .map(([name, value], i) => ({
        name,
        value: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Calculate budget tracking
  const budgetTracking = useMemo(() => {
    if (!projects || !transactions) return [];
    
    return projects
      .filter(p => p.budget && p.budget > 0)
      .map(project => {
        const spent = transactions
          .filter(t => t.project_id === project.id && t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          project: project.name,
          budget: project.budget,
          spent,
          remaining: project.budget - spent,
        };
      })
      .slice(0, 4);
  }, [projects, transactions]);

  const recentTransactions = transactions?.slice(0, 5) || [];
  const recentInvoices = invoices?.slice(0, 4) || [];

  // Calculate pending invoices amount
  const pendingInvoicesAmount = invoices
    ?.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  
  const pendingInvoicesCount = invoices?.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finanzas</h1>
            <p className="text-muted-foreground mt-1">Control financiero y contabilidad</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
          <CreateTransactionDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-3xl font-bold">${stats?.totalIncome.toLocaleString() || 0}</p>
              <p className="text-sm text-success flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                Este año
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
              <p className="text-3xl font-bold">${stats?.totalExpenses.toLocaleString() || 0}</p>
              <p className="text-sm text-destructive flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                Este año
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
              <p className="text-3xl font-bold">${stats?.netMargin.toLocaleString() || 0}</p>
              <p className="text-sm text-success flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                {stats?.marginPercentage.toFixed(1) || 0}% margen
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
              <p className="text-3xl font-bold">${pendingInvoicesAmount.toLocaleString()}</p>
              <p className="text-sm text-warning">{pendingInvoicesCount} facturas pendientes</p>
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
              <p className="text-sm text-muted-foreground">Comparativa mensual {new Date().getFullYear()}</p>
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
              <AreaChart data={chartData}>
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
          {expenseDistribution.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sin gastos registrados</p>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220, 15%, 10%)", border: "1px solid hsl(220, 15%, 15%)", borderRadius: "8px", color: "white" }} formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {expenseDistribution.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sin transacciones</p>
          ) : (
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
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <span className={cn("font-semibold", tx.type === "income" ? "text-success" : "text-destructive")}>
                    {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Facturas</h3>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sin facturas</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => {
                const config = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.pending;
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{inv.invoice_number}</p>
                        <Badge className={cn("text-xs border", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inv.client?.name || 'Sin cliente'} 
                        {inv.due_date && ` • Vence: ${format(new Date(inv.due_date), "d MMM yyyy", { locale: es })}`}
                      </p>
                    </div>
                    <span className="font-semibold">${Number(inv.amount).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Budget Tracking */}
      {budgetTracking.length > 0 && (
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-6">Presupuestos por Proyecto</h3>
          <div className="space-y-6">
            {budgetTracking.map((budget) => (
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
      )}
    </div>
  );
}
