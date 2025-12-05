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

export default function Dashboard() {
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
        <StatsCard
          title="Ingresos del Mes"
          value="$95,420"
          change="+12.5% vs mes anterior"
          changeType="positive"
          icon={DollarSign}
        />
        <StatsCard
          title="Proyectos Activos"
          value="12"
          change="3 completados este mes"
          changeType="positive"
          icon={FolderKanban}
        />
        <StatsCard
          title="Clientes Activos"
          value="48"
          change="+5 nuevos este mes"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Margen Promedio"
          value="42%"
          change="+3.2% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
        />
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
