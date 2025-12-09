import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TasksList } from "@/components/dashboard/TasksList";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import {
  DollarSign,
  FolderKanban,
  Users,
  TrendingUp,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useFinancialStats } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de nuevo. Aquí está el resumen de tu actividad.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatsCard
              title="Ingresos del Mes"
              value={`$${monthlyIncome.toLocaleString()}`}
              change={monthlyIncome > 0 ? "Este mes" : "Sin ingresos aún"}
              changeType={monthlyIncome > 0 ? "positive" : "neutral"}
              icon={DollarSign}
            />
            <StatsCard
              title="Proyectos Activos"
              value={activeProjects.toString()}
              change={`${completedThisMonth} completados este mes`}
              changeType="positive"
              icon={FolderKanban}
            />
            <StatsCard
              title="Clientes"
              value={totalClients.toString()}
              change={newClientsThisMonth > 0 ? `+${newClientsThisMonth} nuevos este mes` : "Sin nuevos este mes"}
              changeType={newClientsThisMonth > 0 ? "positive" : "neutral"}
              icon={Users}
            />
            <StatsCard
              title="Margen"
              value={`${margin}%`}
              change={Number(margin) > 0 ? "Margen positivo" : "Sin datos suficientes"}
              changeType={Number(margin) > 0 ? "positive" : "neutral"}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
