import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  BarChart3,
  FileText,
  Clock,
  Zap,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  { icon: BarChart3, text: "Genera un reporte financiero del Q4", category: "Reportes" },
  { icon: Lightbulb, text: "Analiza el rendimiento de proyectos activos", category: "Análisis" },
  { icon: Clock, text: "Predice posibles retrasos en entregas", category: "Predicción" },
  { icon: FileText, text: "Crea un resumen ejecutivo mensual", category: "Documentos" },
];

const capabilities = [
  {
    icon: Brain,
    title: "Análisis Predictivo",
    description: "Predice retrasos en proyectos y sugiere acciones correctivas basadas en datos históricos.",
  },
  {
    icon: FileText,
    title: "Generación de Reportes",
    description: "Crea reportes financieros, de proyectos y KPIs automáticamente.",
  },
  {
    icon: Zap,
    title: "Automatización",
    description: "Automatiza tareas repetitivas como seguimiento de clientes y recordatorios.",
  },
  {
    icon: Lightbulb,
    title: "Recomendaciones",
    description: "Proporciona insights y recomendaciones basadas en el análisis de datos.",
  },
];

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "¡Hola! Soy tu asistente de IA para BizTech ERP. Puedo ayudarte con análisis de datos, generación de reportes, predicciones y automatización de tareas. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("reporte") || lowerQuery.includes("informe")) {
      return "Puedo generar varios tipos de reportes para ti:\n\n📊 **Reporte Financiero**: Ingresos, gastos y márgenes por período\n📁 **Reporte de Proyectos**: Estado, progreso y métricas de entrega\n👥 **Reporte de Clientes**: Retención, satisfacción y pipeline\n\n¿Qué tipo de reporte te gustaría que genere?";
    }
    
    if (lowerQuery.includes("proyecto") || lowerQuery.includes("tarea")) {
      return "Según mi análisis de los proyectos activos:\n\n🟢 **Rediseño Web BizTech** (75%): En buen camino para entrega el 15 Dic\n🟡 **Sistema CRM** (90%): En revisión final, posible adelanto\n🟠 **App Móvil E-commerce** (45%): Revisar velocidad de desarrollo\n\n⚠️ **Alerta**: El proyecto de App Móvil podría tener retrasos si no se aumenta la velocidad en las próximas 2 semanas.";
    }
    
    if (lowerQuery.includes("cliente") || lowerQuery.includes("crm")) {
      return "Análisis de clientes del último mes:\n\n📈 **Retención**: 85% (↑2% vs mes anterior)\n⭐ **Satisfacción promedio**: 4.8/5\n💰 **Valor promedio por cliente**: $16,900\n\n**Recomendaciones**:\n1. Contactar a DataViz Corp - sin actividad en 7 días\n2. Enviar propuesta de expansión a BizTech Inc.\n3. Agendar reunión de seguimiento con TechStore";
    }
    
    return "Entiendo tu consulta. Para darte una respuesta más precisa, necesito conectarme con la base de datos del sistema. Por ahora, puedo ayudarte con:\n\n• Análisis de proyectos y predicción de entregas\n• Generación de reportes financieros\n• Recomendaciones de seguimiento de clientes\n• Automatización de tareas repetitivas\n\n¿Sobre cuál de estos temas te gustaría más información?";
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Asistente IA</h1>
            <p className="text-muted-foreground mt-1">
              Automatización inteligente para tu negocio
            </p>
          </div>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
          En línea
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 glass rounded-xl flex flex-col h-[600px] animate-fade-in">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "assistant"
                      ? "bg-primary/20"
                      : "bg-secondary"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-4",
                    message.role === "assistant"
                      ? "bg-secondary/50"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="px-6 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <suggestion.icon className="w-3 h-3" />
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} className="gap-2">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Capacidades</h3>
            <div className="space-y-4">
              {capabilities.map((cap, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <cap.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{cap.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Estadísticas IA</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Consultas hoy</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reportes generados</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tareas automatizadas</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiempo ahorrado</span>
                <span className="font-semibold text-primary">12.5h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
