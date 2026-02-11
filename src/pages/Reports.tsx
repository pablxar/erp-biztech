import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { cn } from "@/lib/utils";

const revenueByMonth = [
  { month: "Ene", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Abr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
  { month: "Jul", revenue: 72000 },
  { month: "Ago", revenue: 69000 },
  { month: "Sep", revenue: 78000 },
  { month: "Oct", revenue: 82000 },
  { month: "Nov", revenue: 88000 },
  { month: "Dic", revenue: 95000 },
];

const projectsByStatus = [
  { name: "Completados", value: 8, color: "hsl(214, 80%, 51%)" },
  { name: "En Progreso", value: 5, color: "hsl(199, 89%, 48%)" },
  { name: "En Revisión", value: 2, color: "hsl(38, 92%, 50%)" },
  { name: "Pendientes", value: 3, color: "hsl(220, 15%, 40%)" },
];

const teamPerformance = [
  { name: "AD", tasks: 45, completed: 42, efficiency: 93 },
  { name: "JM", tasks: 38, completed: 35, efficiency: 92 },
  { name: "LC", tasks: 32, completed: 28, efficiency: 88 },
  { name: "RS", tasks: 28, completed: 24, efficiency: 86 },
];

const clientRetention = [
  { name: "Retención", value: 85, fill: "hsl(214, 80%, 51%)" },
];

const kpis = [
  { title: "Ingresos Anuales", value: "$812,000", change: "+18.2%", trend: "up", icon: DollarSign },
  { title: "Proyectos Completados", value: "24", change: "+33%", trend: "up", icon: FolderKanban },
  { title: "Satisfacción Cliente", value: "4.8/5", change: "+0.3", trend: "up", icon: Users },
  { title: "Tiempo Promedio", value: "32 días", change: "-5 días", trend: "up", icon: Clock },
];

const reports = [
  { id: 1, name: "Reporte Financiero Q4 2025", type: "Finanzas", date: "1 Dic 2025", size: "2.4 MB" },
  { id: 2, name: "Análisis de Proyectos Nov 2025", type: "Proyectos", date: "30 Nov 2025", size: "1.8 MB" },
  { id: 3, name: "Métricas de Clientes Q4", type: "CRM", date: "28 Nov 2025", size: "1.2 MB" },
  { id: 4, name: "Rendimiento del Equipo Nov", type: "Equipo", date: "25 Nov 2025", size: "890 KB" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground mt-1">
            KPIs, métricas y reportes del negocio
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="glass rounded-xl p-6 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-bold">{kpi.value}</p>
                <p className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  kpi.trend === "up" ? "text-success" : "text-destructive"
                )}>
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {kpi.change}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <kpi.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Tendencia de Ingresos</h3>
              <p className="text-sm text-muted-foreground">Ingresos mensuales 2025</p>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              +18.2% YoY
            </Badge>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(214, 80%, 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(214, 80%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(220, 15%, 10%)", border: "1px solid hsl(220, 15%, 15%)", borderRadius: "8px", color: "white" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Ingresos"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(214, 80%, 51%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-6">Proyectos por Estado</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={projectsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 15%, 10%)", border: "1px solid hsl(220, 15%, 15%)", borderRadius: "8px", color: "white" }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {projectsByStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-6">Rendimiento del Equipo</h3>
          <div className="space-y-4">
            {teamPerformance.map((member) => (
              <div key={member.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {member.name}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.completed}/{member.tasks} tareas</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={cn(
                    member.efficiency >= 90 ? "bg-success/10 text-success" :
                    member.efficiency >= 85 ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  )}>
                    {member.efficiency}%
                  </Badge>
                </div>
                <Progress value={member.efficiency} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Client Retention */}
        <div className="glass rounded-xl p-6 animate-slide-up">
          <h3 className="text-lg font-semibold mb-6">Retención de Clientes</h3>
          <div className="flex items-center justify-center h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={clientRetention} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-4xl font-bold text-primary">85%</p>
              <p className="text-sm text-muted-foreground">Retención</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xl font-bold">48</p>
              <p className="text-xs text-muted-foreground">Clientes Activos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Nuevos (Mes)</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xl font-bold">4.8</p>
              <p className="text-xs text-muted-foreground">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Reportes Generados</h3>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Generar Nuevo
          </Button>
        </div>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.type} • {report.date} • {report.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
