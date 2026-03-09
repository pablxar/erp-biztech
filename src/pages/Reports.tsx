import { BarChart3, FileText, PieChart, TrendingUp } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">Análisis y estadísticas de tu negocio</p>
      </div>

      {/* Coming Soon */}
      <div className="glass rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center border border-dashed border-border">
        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
        </div>
        <h3 className="text-lg lg:text-xl font-semibold mb-2">Próximamente</h3>
        <p className="text-muted-foreground text-sm lg:text-base max-w-md mx-auto mb-6">
          Estamos trabajando en reportes avanzados con gráficos interactivos y métricas clave
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 max-w-2xl mx-auto">
          {[
            { icon: TrendingUp, label: "Ingresos" },
            { icon: PieChart, label: "Gastos" },
            { icon: FileText, label: "Proyectos" },
            { icon: BarChart3, label: "Clientes" },
          ].map((item) => (
            <div key={item.label} className="p-3 lg:p-4 rounded-lg lg:rounded-xl bg-secondary/30 border border-border/50">
              <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
