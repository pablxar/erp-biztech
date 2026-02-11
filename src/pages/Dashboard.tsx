import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TasksList } from "@/components/dashboard/TasksList";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  DollarSign,
  FolderKanban,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useFinancialStats } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const { data: financeStats, isLoading: financeLoading } = useFinancialStats();

  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedThisMonth = projects?.filter(p => {
    if (p.status !== 'completed') return false;
    const date = new Date(p.updated_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length || 0;

  const totalClients = clients?.length || 0;
  const newClientsThisMonth = clients?.filter(c => {
    const date = new Date(c.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length || 0;

  const monthlyIncome = financeStats?.monthlyIncome || 0;
  const monthlyExpenses = financeStats?.monthlyExpenses || 0;
  const margin = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/20 border border-border/50 p-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="capitalize">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              ¡Bienvenido de nuevo!
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Aquí tienes un resumen completo de tu actividad. Gestiona tus proyectos, 
              clientes y finanzas desde un solo lugar.
            </p>
          </div>
          
          <QuickActions />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeLoading ? (
          <>
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </>
        ) : (
          <>
            <StatsCard
              title="Ingresos del Mes"
              value={`$${monthlyIncome.toLocaleString()}`}
              change={monthlyIncome > 0 ? "Este mes" : "Sin ingresos aún"}
              changeType={monthlyIncome > 0 ? "positive" : "neutral"}
              icon={DollarSign}
              gradient="from-primary/20 to-primary/5"
              iconGradient="from-primary to-blue-400"
            />
            <StatsCard
              title="Proyectos Activos"
              value={activeProjects.toString()}
              change={`${completedThisMonth} completados este mes`}
              changeType="positive"
              icon={FolderKanban}
              gradient="from-blue-500/20 to-blue-500/5"
              iconGradient="from-blue-500 to-blue-400"
            />
            <StatsCard
              title="Clientes"
              value={totalClients.toString()}
              change={newClientsThisMonth > 0 ? `+${newClientsThisMonth} nuevos este mes` : "Sin nuevos este mes"}
              changeType={newClientsThisMonth > 0 ? "positive" : "neutral"}
              icon={Users}
              gradient="from-violet-500/20 to-violet-500/5"
              iconGradient="from-violet-500 to-violet-400"
            />
            <StatsCard
              title="Margen"
              value={`${margin}%`}
              change={Number(margin) > 0 ? "Margen positivo" : "Sin datos suficientes"}
              changeType={Number(margin) > 0 ? "positive" : "neutral"}
              icon={TrendingUp}
              gradient="from-amber-500/20 to-amber-500/5"
              iconGradient="from-amber-500 to-amber-400"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <TasksList />
      </div>
    </div>
  );
}
