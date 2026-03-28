import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { RegisterPaymentDialog } from "@/components/projects/RegisterPaymentDialog";
import { Project } from "@/hooks/useProjects";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Calendar,
  Wallet,
  CreditCard,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  Sparkles,
  TrendingUpIcon,
  ArrowRight,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Banknote,
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
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { useTransactions, useFinancialStats, useDeleteTransaction } from "@/hooks/useTransactions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { CreateTransactionDialog } from "@/components/finance/CreateTransactionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const statusConfig = {
  paid: { label: "Pagada", color: "bg-success/20 text-success border-success/30", icon: CheckCircle2 },
  pending: { label: "Pendiente", color: "bg-warning/20 text-warning border-warning/30", icon: Clock },
  overdue: { label: "Vencida", color: "bg-destructive/20 text-destructive border-destructive/30", icon: AlertTriangle },
  draft: { label: "Borrador", color: "bg-muted text-muted-foreground border-muted", icon: Clock },
};

const categoryIcons: Record<string, typeof Wallet> = {
  "Software": CreditCard,
  "Marketing": Target,
  "Servicios": Zap,
  "Personal": Wallet,
  "Otros": BarChart3,
};

export default function Finance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [activeView, setActiveView] = useState<"overview" | "transactions" | "invoices" | "budgets">("overview");
  const [showReceivables, setShowReceivables] = useState(false);
  const [paymentProject, setPaymentProject] = useState<{ project: Project; paid: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  const { data: stats, isLoading: statsLoading } = useFinancialStats();
  const { data: invoices } = useInvoices();
  const { data: projects } = useProjects();

  const isLoading = transactionsLoading || statsLoading;

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    if (!transactions || !stats) return null;

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);

    // Current month transactions
    const currentMonthTx = transactions.filter(tx => {
      const date = new Date(tx.date);
      return isWithinInterval(date, { start: startOfMonth(now), end: endOfMonth(now) });
    });

    // Last month transactions
    const lastMonthTx = transactions.filter(tx => {
      const date = new Date(tx.date);
      return isWithinInterval(date, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
    });

    const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const currentExpenses = currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const lastExpenses = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const incomeGrowth = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseGrowth = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    // Average transaction value
    const avgTransactionValue = transactions.length > 0 
      ? transactions.reduce((s, t) => s + Number(t.amount), 0) / transactions.length 
      : 0;

    // Burn rate (monthly expenses average)
    const monthlyExpenses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const month = subMonths(now, i);
      const monthTx = transactions.filter(tx => {
        const date = new Date(tx.date);
        return isWithinInterval(date, { start: startOfMonth(month), end: endOfMonth(month) }) && tx.type === 'expense';
      });
      monthlyExpenses.push(monthTx.reduce((s, t) => s + Number(t.amount), 0));
    }
    const burnRate = monthlyExpenses.reduce((s, v) => s + v, 0) / 6;

    // Runway (if we have net margin)
    const runway = burnRate > 0 && stats.netMargin > 0 ? Math.floor(stats.netMargin / burnRate) : 0;

    return {
      currentIncome,
      currentExpenses,
      incomeGrowth,
      expenseGrowth,
      avgTransactionValue,
      burnRate,
      runway,
      transactionCount: transactions.length,
    };
  }, [transactions, stats]);

  // Monthly chart data with comparison
  const chartData = useMemo(() => {
    if (!transactions) return months.map(month => ({ month, ingresos: 0, gastos: 0, neto: 0 }));

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
      neto: monthlyData[i].ingresos - monthlyData[i].gastos,
    }));
  }, [transactions]);

  // Expense distribution with enhanced data
  const expenseDistribution = useMemo(() => {
    if (!transactions) return [];
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const categories: Record<string, { amount: number; count: number }> = {};
    expenses.forEach(t => {
      const cat = t.category || 'Otros';
      if (!categories[cat]) categories[cat] = { amount: 0, count: 0 };
      categories[cat].amount += Number(t.amount);
      categories[cat].count += 1;
    });

    const colors = [
      "hsl(214, 80%, 51%)", 
      "hsl(199, 89%, 48%)", 
      "hsl(38, 92%, 50%)", 
      "hsl(280, 65%, 60%)", 
      "hsl(340, 75%, 55%)",
      "hsl(220, 15%, 50%)"
    ];
    
    return Object.entries(categories)
      .map(([name, data], i) => ({
        name,
        value: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
        amount: data.amount,
        count: data.count,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // Weekly comparison data
  const weeklyData = useMemo(() => {
    if (!transactions) return [];
    
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const now = new Date();
    const dayData: Record<number, { ingresos: number; gastos: number }> = {};
    
    for (let i = 0; i < 7; i++) {
      dayData[i] = { ingresos: 0, gastos: 0 };
    }

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = (6 - diffDays + date.getDay()) % 7;
        if (tx.type === 'income') {
          dayData[dayIndex].ingresos += Number(tx.amount);
        } else {
          dayData[dayIndex].gastos += Number(tx.amount);
        }
      }
    });

    return days.map((day, i) => ({
      day,
      ingresos: dayData[i].ingresos,
      gastos: dayData[i].gastos,
    }));
  }, [transactions]);


  // Pending invoices with urgency
  // Calculate payments made per project from transactions
  const projectPaymentsMap = useMemo(() => {
    if (!transactions) return new Map<string, number>();
    const map = new Map<string, number>();
    transactions
      .filter(t => t.type === 'income' && t.project_id)
      .forEach(t => {
        const current = map.get(t.project_id!) || 0;
        map.set(t.project_id!, current + Number(t.amount));
      });
    return map;
  }, [transactions]);

  const pendingInvoices = useMemo(() => {
    if (!invoices) return { total: 0, count: 0, urgent: 0, items: [], pendingProjects: [], projectPayments: new Map<string, number>() };
    
    const pending = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
    const urgent = pending.filter(inv => inv.status === 'overdue').length;

    // Only include projects with an agreed price (budget > 0) and pending payment
    const pendingProjects = (projects || []).filter(
      p => (p.payment_status === 'pending' || p.payment_status === 'partial') 
        && Number(p.budget) > 0
    );
    
    // Calculate remaining balance per project (budget - payments made)
    const projectsTotal = pendingProjects.reduce((sum, p) => {
      const paid = projectPaymentsMap.get(p.id) || 0;
      const remaining = Math.max(0, Number(p.budget) - paid);
      return sum + remaining;
    }, 0);
    
    return {
      total: pending.reduce((sum, inv) => sum + Number(inv.amount), 0) + projectsTotal,
      count: pending.length + pendingProjects.length,
      urgent,
      items: pending.slice(0, 5),
      pendingProjects,
      projectPayments: projectPaymentsMap,
    };
  }, [invoices, projects, projectPaymentsMap]);

  // Recent transactions filtered
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(tx => 
        searchQuery === "" || 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [transactions, searchQuery]);

  // Quick insights
  const insights = useMemo(() => {
    if (!analytics || !stats) return [];
    
    const items = [];
    
    if (analytics.incomeGrowth > 10) {
      items.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Ingresos en alza',
        description: `+${analytics.incomeGrowth.toFixed(1)}% vs mes anterior`,
      });
    } else if (analytics.incomeGrowth < -10) {
      items.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Ingresos decreciendo',
        description: `${analytics.incomeGrowth.toFixed(1)}% vs mes anterior`,
      });
    }

    if (pendingInvoices.urgent > 0) {
      items.push({
        type: 'error',
        icon: AlertTriangle,
        title: 'Facturas vencidas',
        description: `${pendingInvoices.urgent} facturas requieren atención`,
      });
    }

    if (stats.marginPercentage > 30) {
      items.push({
        type: 'success',
        icon: Target,
        title: 'Margen saludable',
        description: `${stats.marginPercentage.toFixed(1)}% de rentabilidad`,
      });
    }

    if (analytics.runway > 6) {
      items.push({
        type: 'info',
        icon: Sparkles,
        title: 'Runway sólido',
        description: `${analytics.runway} meses de operación`,
      });
    }

    return items.slice(0, 3);
  }, [analytics, stats, pendingInvoices]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-0 lg:p-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Centro Financiero</h1>
              <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">
                Análisis en tiempo real • {format(new Date(), "d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="relative flex-1 min-w-[140px] lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50 h-8 lg:h-9 text-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 lg:h-9 lg:w-9">
            <Filter className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </Button>
          <Button variant="outline" className="gap-1.5 shrink-0 h-8 lg:h-9 text-xs lg:text-sm px-2.5 lg:px-3">
            <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <CreateTransactionDialog />
        </div>
      </div>

      {/* Quick Insights Banner */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
          {insights.map((insight, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02]",
                insight.type === 'success' && "bg-success/5 border-success/20",
                insight.type === 'warning' && "bg-warning/5 border-warning/20",
                insight.type === 'error' && "bg-destructive/5 border-destructive/20",
                insight.type === 'info' && "bg-primary/5 border-primary/20",
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                insight.type === 'success' && "bg-success/10",
                insight.type === 'warning' && "bg-warning/10",
                insight.type === 'error' && "bg-destructive/10",
                insight.type === 'info' && "bg-primary/10",
              )}>
                <insight.icon className={cn(
                  "w-5 h-5",
                  insight.type === 'success' && "text-success",
                  insight.type === 'warning' && "text-warning",
                  insight.type === 'error' && "text-destructive",
                  insight.type === 'info' && "text-primary",
                )} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{insight.title}</p>
                <p className="text-xs text-muted-foreground truncate">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Income */}
        <div className="glass rounded-xl p-3 lg:p-5 animate-fade-in group hover:border-primary/30 transition-all">
          <div className="flex items-start justify-between mb-2 lg:mb-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
            </div>
            {analytics && analytics.incomeGrowth !== 0 && (
              <Badge variant="outline" className={cn(
                "text-[10px] lg:text-xs border hidden sm:flex",
                analytics.incomeGrowth > 0 ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"
              )}>
                {analytics.incomeGrowth > 0 ? "+" : ""}{analytics.incomeGrowth.toFixed(1)}%
              </Badge>
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Ingresos</p>
          <p className="text-lg sm:text-xl lg:text-3xl font-bold truncate">${stats?.totalIncome.toLocaleString() || 0}</p>
          <div className="mt-1.5 lg:mt-2 flex items-center gap-1 text-[10px] lg:text-xs text-muted-foreground hidden sm:flex">
            <ArrowUpRight className="w-3 h-3 text-success" />
            <span>Mes: ${analytics?.currentIncome.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass rounded-xl p-3 lg:p-5 animate-fade-in group hover:border-destructive/30 transition-all">
          <div className="flex items-start justify-between mb-2 lg:mb-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
              <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-destructive" />
            </div>
            {analytics && analytics.expenseGrowth !== 0 && (
              <Badge variant="outline" className={cn(
                "text-[10px] lg:text-xs border hidden sm:flex",
                analytics.expenseGrowth < 0 ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"
              )}>
                {analytics.expenseGrowth > 0 ? "+" : ""}{analytics.expenseGrowth.toFixed(1)}%
              </Badge>
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Gastos</p>
          <p className="text-lg sm:text-xl lg:text-3xl font-bold truncate">${stats?.totalExpenses.toLocaleString() || 0}</p>
          <div className="mt-1.5 lg:mt-2 flex items-center gap-1 text-[10px] lg:text-xs text-muted-foreground hidden sm:flex">
            <ArrowDownRight className="w-3 h-3 text-destructive" />
            <span>Mes: ${analytics?.currentExpenses.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Net Margin */}
        <div className="glass rounded-xl p-3 lg:p-5 animate-fade-in group hover:border-primary/30 transition-all">
          <div className="flex items-start justify-between mb-2 lg:mb-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <PiggyBank className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] lg:text-xs">
              {stats?.marginPercentage.toFixed(1) || 0}%
            </Badge>
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Margen</p>
          <p className="text-lg sm:text-xl lg:text-3xl font-bold truncate">${stats?.netMargin.toLocaleString() || 0}</p>
          <div className="mt-1.5 lg:mt-2">
            <Progress 
              value={Math.min(stats?.marginPercentage || 0, 100)} 
              className="h-1 lg:h-1.5"
            />
          </div>
        </div>

        {/* Pending Invoices - Clickable */}
        <div 
          className="glass rounded-xl p-3 lg:p-5 animate-fade-in group hover:border-warning/30 transition-all cursor-pointer"
          onClick={() => setShowReceivables(true)}
        >
          <div className="flex items-start justify-between mb-2 lg:mb-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
              <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-warning" />
            </div>
            {pendingInvoices.urgent > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] lg:text-xs animate-pulse">
                {pendingInvoices.urgent} vencidas
              </Badge>
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground mb-0.5 lg:mb-1">Por Cobrar</p>
          <p className="text-lg sm:text-xl lg:text-3xl font-bold truncate">${pendingInvoices.total.toLocaleString()}</p>
          <div className="mt-1.5 lg:mt-2 flex items-center gap-1 text-[10px] lg:text-xs text-muted-foreground hidden sm:flex">
            <Clock className="w-3 h-3" />
            <span>{pendingInvoices.count} pendientes</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Revenue Chart */}
        <div className="xl:col-span-2 glass rounded-xl p-4 lg:p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Flujo de Caja
              </h3>
              <p className="text-sm text-muted-foreground">Análisis mensual {new Date().getFullYear()}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <span className="text-muted-foreground">Gastos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-info" />
                <span className="text-muted-foreground">Neto</span>
              </div>
            </div>
          </div>
          
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(214, 80%, 51%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(214, 80%, 51%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(220, 10%, 55%)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(220, 10%, 55%)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `$${v / 1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0, 0%, 100%)", 
                    border: "1px solid hsl(220, 13%, 91%)", 
                    borderRadius: "12px", 
                    color: "hsl(220, 15%, 15%)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
                  }} 
                  formatter={(v: number, name: string) => [
                    `$${v.toLocaleString()}`, 
                    name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : 'Neto'
                  ]} 
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="hsl(214, 80%, 51%)" 
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
                <Line 
                  type="monotone" 
                  dataKey="neto" 
                  stroke="hsl(199, 89%, 48%)" 
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(199, 89%, 48%)", r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Distribución
              </h3>
              <p className="text-sm text-muted-foreground">Por categoría</p>
            </div>
          </div>
          
          {expenseDistribution.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <div className="p-4 rounded-full bg-secondary/50 mb-3">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Sin gastos registrados</p>
            </div>
          ) : (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={expenseDistribution} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={75} 
                      paddingAngle={3} 
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {expenseDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="transition-all hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid hsl(220, 13%, 91%)", 
                        borderRadius: "12px", 
                        color: "hsl(220, 15%, 15%)" 
                      }} 
                      formatter={(v: number, name: string, props: any) => [
                        `${v}% ($${props.payload.amount.toLocaleString()})`, 
                        props.payload.name
                      ]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 mt-4">
                {expenseDistribution.slice(0, 5).map((cat) => {
                  const Icon = categoryIcons[cat.name] || BarChart3;
                  return (
                    <div 
                      key={cat.name} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{cat.name}</span>
                          <p className="text-xs text-muted-foreground">{cat.count} transacciones</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">{cat.value}%</span>
                        <p className="text-xs text-muted-foreground">${cat.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Transacciones Recientes
            </h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-secondary/50 mb-3">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No se encontraron transacciones" : "Sin transacciones"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx, i) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all group cursor-pointer"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                      tx.type === "income" ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {tx.type === "income" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate max-w-[180px]">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(tx.date), "d MMM", { locale: es })}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span className="truncate">{tx.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "font-semibold tabular-nums",
                    tx.type === "income" ? "text-success" : "text-destructive"
                  )}>
                    {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Facturas Pendientes
            </h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          {pendingInvoices.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-success/10 mb-3">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm font-medium text-success">¡Todo al día!</p>
              <p className="text-xs text-muted-foreground">No hay facturas pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingInvoices.items.map((inv, i) => {
                const config = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <div 
                    key={inv.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all group cursor-pointer"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        inv.status === 'overdue' ? "bg-destructive/10" : "bg-warning/10"
                      )}>
                        <StatusIcon className={cn(
                          "w-4 h-4",
                          inv.status === 'overdue' ? "text-destructive" : "text-warning"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{inv.invoice_number}</p>
                          <Badge className={cn("text-[10px] px-1.5 py-0 border", config.color)}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {inv.client?.name || 'Sin cliente'} 
                          {inv.due_date && ` • ${format(new Date(inv.due_date), "d MMM", { locale: es })}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold tabular-nums">${Number(inv.amount).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Promedio por Transacción</span>
            </div>
            <p className="text-xl font-bold">${analytics.avgTransactionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-info" />
              <span className="text-xs text-muted-foreground">Total Transacciones</span>
            </div>
            <p className="text-xl font-bold">{analytics.transactionCount}</p>
          </div>
          
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Burn Rate Mensual</span>
            </div>
            <p className="text-xl font-bold">${analytics.burnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Runway Estimado</span>
            </div>
            <p className="text-xl font-bold">{analytics.runway > 0 ? `${analytics.runway} meses` : '—'}</p>
          </div>
        </div>
      )}

      {/* Receivables Breakdown Dialog */}
      <Dialog open={showReceivables} onOpenChange={setShowReceivables}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-warning" />
              Desglose de Cuentas por Cobrar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/20">
              <span className="text-sm font-medium">Total Por Cobrar</span>
              <span className="text-2xl font-bold">${pendingInvoices.total.toLocaleString()}</span>
            </div>

            {/* Invoices Section */}
            {pendingInvoices.items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  Facturas Pendientes ({pendingInvoices.items.length})
                </h3>
                <div className="space-y-2">
                  {pendingInvoices.items.map((inv) => {
                    const config = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.pending;
                    return (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{inv.invoice_number}</span>
                            <Badge variant="outline" className={cn("text-xs", config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inv.client?.name || 'Sin cliente'}
                            {inv.due_date && ` • Vence: ${format(new Date(inv.due_date), "d MMM yyyy", { locale: es })}`}
                          </p>
                        </div>
                        <span className="font-semibold text-sm">${Number(inv.amount).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {pendingInvoices.pendingProjects && pendingInvoices.pendingProjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  Proyectos Por Cobrar ({pendingInvoices.pendingProjects.length})
                </h3>
                <div className="space-y-2">
                  {pendingInvoices.pendingProjects.map((project) => {
                    const budget = Number(project.budget);
                    const paid = pendingInvoices.projectPayments.get(project.id) || 0;
                    const remaining = Math.max(0, budget - paid);
                    const progress = budget > 0 ? (paid / budget) * 100 : 0;
                    return (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{project.name}</span>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              project.payment_status === 'partial' 
                                ? "bg-warning/20 text-warning border-warning/30" 
                                : "bg-primary/20 text-primary border-primary/30"
                            )}>
                              {project.payment_status === 'partial' ? 'Parcial' : 'Pendiente'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {project.clients?.name || 'Sin cliente'}
                            {paid > 0 && ` • Cobrado: $${paid.toLocaleString()}`}
                          </p>
                          {paid > 0 && (
                            <Progress value={progress} className="h-1 mt-1.5" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className="text-right">
                            <span className="font-semibold text-sm">${remaining.toLocaleString()}</span>
                            {paid > 0 && (
                              <p className="text-[10px] text-muted-foreground">de ${budget.toLocaleString()}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 shrink-0"
                            onClick={() => {
                              setShowReceivables(false);
                              setPaymentProject({ project, paid });
                            }}
                          >
                            <Banknote className="w-3 h-3" />
                            Cobrar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pendingInvoices.count === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success" />
                <p className="font-medium">Todo al día</p>
                <p className="text-sm">No hay cuentas pendientes por cobrar</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Payment Dialog */}
      {paymentProject && (
        <RegisterPaymentDialog
          project={paymentProject.project}
          open={!!paymentProject}
          onOpenChange={(open) => {
            if (!open) setPaymentProject(null);
          }}
          previousPayments={paymentProject.paid}
        />
      )}
    </div>
  );
}
