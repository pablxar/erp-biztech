import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MessageSquarePlus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ChevronRight,
  Activity,
  TrendingUp,
  Target,
  Loader2,
  AlertCircle,
  Mic,
  PanelRightClose,
  PanelRight,
  Settings2,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const quickActions = [
  { 
    icon: BarChart3, 
    text: "Genera un reporte financiero del último mes", 
    category: "Reportes",
    gradient: "from-success/20 to-success/5"
  },
  { 
    icon: TrendingUp, 
    text: "Analiza el rendimiento de proyectos activos", 
    category: "Análisis",
    gradient: "from-info/20 to-info/5"
  },
  { 
    icon: Clock, 
    text: "¿Qué tareas tienen prioridad alta pendientes?", 
    category: "Tareas",
    gradient: "from-warning/20 to-warning/5"
  },
  { 
    icon: Target, 
    text: "Resume el estado de los leads este mes", 
    category: "Ventas",
    gradient: "from-primary/20 to-primary/5"
  },
];

const capabilities = [
  {
    icon: Brain,
    title: "Análisis Inteligente",
    description: "Interpreta datos de proyectos, finanzas y clientes con insights accionables.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FileText,
    title: "Generación de Reportes",
    description: "Crea informes ejecutivos, financieros y de KPIs automáticamente.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Zap,
    title: "Automatización",
    description: "Optimiza flujos de trabajo y sugiere automatizaciones inteligentes.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Lightbulb,
    title: "Recomendaciones",
    description: "Proporciona sugerencias basadas en patrones y mejores prácticas.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) {
      throw new Error("rate_limit");
    }
    if (resp.status === 402) {
      throw new Error("payment_required");
    }
    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    return resp;
  };

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = generateId();
    let assistantContent = "";

    // Add placeholder for assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await streamChat(conversationHistory);
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, isStreaming: false }
          : m
      ));

    } catch (error) {
      console.error("Chat error:", error);
      
      // Remove the streaming message
      setMessages(prev => prev.filter(m => m.id !== assistantId));

      if (error instanceof Error) {
        if (error.message === "rate_limit") {
          toast.error("Límite de solicitudes excedido", {
            description: "Por favor, espera unos momentos antes de enviar otro mensaje."
          });
        } else if (error.message === "payment_required") {
          toast.error("Créditos agotados", {
            description: "Necesitas recargar créditos para continuar usando el asistente."
          });
        } else {
          toast.error("Error de conexión", {
            description: "No se pudo conectar con el asistente. Intenta de nuevo."
          });
        }
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Conversación limpiada");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmptyState = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 p-1">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                Asistente IA
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                  Gemini 3 Flash
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">Tu copiloto empresarial inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            {isEmptyState ? (
              /* Welcome State */
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <div className="relative mb-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 animate-pulse-glow">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 rounded-xl bg-success/20 border border-success/30">
                    <Sparkles className="w-4 h-4 text-success" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">¡Hola! Soy tu Asistente IA</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Estoy aquí para ayudarte con análisis de datos, reportes, predicciones y automatizaciones. 
                  ¿En qué puedo asistirte hoy?
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.text)}
                      disabled={isLoading}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl text-left transition-all",
                        "bg-gradient-to-br border border-border/50",
                        "hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        action.gradient
                      )}
                    >
                      <div className="p-2 rounded-lg bg-background/50">
                        <action.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{action.text}</p>
                        <Badge variant="outline" className="text-[10px] mt-2 px-1.5 py-0">
                          {action.category}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-fade-in",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110",
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                          : "bg-secondary border border-border/50"
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
                        "group relative max-w-[85%] rounded-2xl p-4",
                        message.role === "assistant"
                          ? "bg-secondary/50 border border-border/30"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className={cn(
                        "text-sm whitespace-pre-wrap leading-relaxed",
                        message.isStreaming && "animate-pulse"
                      )}>
                        {message.content || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Pensando...
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                        <p className="text-[10px] opacity-60">
                          {format(message.timestamp, "HH:mm", { locale: es })}
                        </p>
                        
                        {message.role === "assistant" && message.content && !message.isStreaming && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(message.content, message.id)}
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-secondary/50 border border-border/50 focus-within:border-primary/50 transition-colors">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje o pregunta..."
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-2"
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()}
                size="sm"
                className="shrink-0 gap-2 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              El asistente puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "w-80 shrink-0 space-y-4 transition-all duration-300",
        showSidebar ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 w-0 overflow-hidden",
        "hidden lg:block"
      )}>
        {/* Capabilities */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Capacidades</h3>
          </div>
          <div className="space-y-3">
            {capabilities.map((cap, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", cap.bg)}>
                    <cap.icon className={cn("w-4 h-4", cap.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{cap.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {cap.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm">Tips de Uso</h3>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Sé específico con fechas y métricas que necesitas</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Pide comparaciones entre períodos para mejor contexto</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Solicita acciones concretas, no solo información</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Puedes continuar la conversación para profundizar</p>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Modelo Activo</h3>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Gemini 3 Flash</p>
                <p className="text-[10px] text-muted-foreground">google/gemini-3-flash-preview</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
              Activo
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
