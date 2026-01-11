import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Eres un asistente de IA empresarial avanzado para BizTech ERP, un sistema de gestión integral. Tu rol es ayudar a los usuarios con análisis de datos reales del sistema.

## Capacidades Principales:
1. **Análisis de Datos**: Interpretar métricas de proyectos, finanzas y clientes CON DATOS REALES
2. **Generación de Reportes**: Crear resúmenes ejecutivos basados en información actualizada
3. **Predicciones**: Identificar posibles retrasos, riesgos y oportunidades
4. **Recomendaciones**: Sugerir acciones concretas basadas en los datos

## Contexto del Sistema:
- Tienes acceso a datos reales de: Proyectos, Clientes, Finanzas, Tareas, Leads y Eventos
- Cuando se te proporcionen datos, ÚSALOS para dar respuestas precisas y específicas
- Si no hay datos disponibles, indícalo claramente

## Estilo de Respuesta:
- Sé conciso pero completo
- Usa emojis para hacer las respuestas más visuales (📊 💡 ⚠️ ✅ 📈 💰 👥 📅)
- Estructura las respuestas con listas y secciones
- Incluye números y métricas específicas de los datos proporcionados
- Ofrece acciones concretas y recomendaciones

## Formato:
- Usa **negritas** para términos importantes
- Usa listas con viñetas para claridad
- Siempre menciona la fuente de los datos (ej: "Según los datos del sistema...")
- Termina con recomendaciones o próximos pasos cuando sea apropiado

Responde siempre en español de manera profesional pero accesible.`;

interface DataContext {
  projects?: any[];
  clients?: any[];
  transactions?: any[];
  leads?: any[];
  tasks?: any[];
  todos?: any[];
  events?: any[];
  invoices?: any[];
  stats?: any;
}

function formatDataContext(context: DataContext): string {
  const sections: string[] = [];

  if (context.stats) {
    sections.push(`
## 📊 ESTADÍSTICAS FINANCIERAS ACTUALES:
- Ingresos Totales: $${context.stats.totalIncome?.toLocaleString() || 0}
- Gastos Totales: $${context.stats.totalExpenses?.toLocaleString() || 0}
- Margen Neto: $${context.stats.netMargin?.toLocaleString() || 0}
- Porcentaje de Margen: ${context.stats.marginPercentage?.toFixed(1) || 0}%
- Ingresos del Mes: $${context.stats.monthlyIncome?.toLocaleString() || 0}
- Gastos del Mes: $${context.stats.monthlyExpenses?.toLocaleString() || 0}`);
  }

  if (context.projects && context.projects.length > 0) {
    const projectsList = context.projects.map(p => 
      `  - "${p.name}" | Estado: ${p.status} | Progreso: ${p.progress || 0}% | Presupuesto: $${p.budget?.toLocaleString() || 0} | Cliente: ${p.client?.name || 'Sin cliente'}`
    ).join('\n');
    sections.push(`
## 📁 PROYECTOS (${context.projects.length} total):
${projectsList}`);
  }

  if (context.clients && context.clients.length > 0) {
    const clientsList = context.clients.map(c => 
      `  - "${c.name}" | Empresa: ${c.company || 'N/A'} | Email: ${c.email || 'N/A'} | Tel: ${c.phone || 'N/A'}`
    ).join('\n');
    sections.push(`
## 👥 CLIENTES (${context.clients.length} total):
${clientsList}`);
  }

  if (context.transactions && context.transactions.length > 0) {
    const income = context.transactions.filter(t => t.type === 'income');
    const expenses = context.transactions.filter(t => t.type === 'expense');
    const recentTx = context.transactions.slice(0, 10).map(t => 
      `  - ${t.type === 'income' ? '📈' : '📉'} "${t.description}" | $${Number(t.amount).toLocaleString()} | ${t.category || 'Sin categoría'} | ${t.date}`
    ).join('\n');
    sections.push(`
## 💰 TRANSACCIONES:
- Total de transacciones: ${context.transactions.length}
- Ingresos registrados: ${income.length}
- Gastos registrados: ${expenses.length}

Transacciones recientes:
${recentTx}`);
  }

  if (context.leads && context.leads.length > 0) {
    const byStatus = {
      new: context.leads.filter(l => l.status === 'new').length,
      contacted: context.leads.filter(l => l.status === 'contacted').length,
      qualified: context.leads.filter(l => l.status === 'qualified').length,
      converted: context.leads.filter(l => l.status === 'converted').length,
      discarded: context.leads.filter(l => l.status === 'discarded').length,
    };
    const leadsList = context.leads.slice(0, 10).map(l => 
      `  - "${l.name}" | Empresa: ${l.company || 'N/A'} | Estado: ${l.status} | Prioridad: ${l.priority || 'media'} | Fuente: ${l.source || 'N/A'}`
    ).join('\n');
    sections.push(`
## 🎯 LEADS (${context.leads.length} total):
- Nuevos: ${byStatus.new}
- Contactados: ${byStatus.contacted}
- Calificados: ${byStatus.qualified}
- Convertidos: ${byStatus.converted}
- Descartados: ${byStatus.discarded}

Leads recientes:
${leadsList}`);
  }

  if (context.tasks && context.tasks.length > 0) {
    const byStatus = {
      todo: context.tasks.filter(t => t.status === 'todo').length,
      in_progress: context.tasks.filter(t => t.status === 'in_progress').length,
      completed: context.tasks.filter(t => t.status === 'completed').length,
    };
    const highPriority = context.tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    const tasksList = highPriority.slice(0, 8).map(t => 
      `  - ⚠️ "${t.title}" | Proyecto: ${t.project?.name || 'N/A'} | Estado: ${t.status} | Vence: ${t.due_date || 'Sin fecha'}`
    ).join('\n');
    sections.push(`
## ✅ TAREAS DE PROYECTOS (${context.tasks.length} total):
- Pendientes: ${byStatus.todo}
- En progreso: ${byStatus.in_progress}
- Completadas: ${byStatus.completed}
- Alta prioridad sin completar: ${highPriority.length}

Tareas de alta prioridad:
${tasksList || '  Ninguna'}`);
  }

  if (context.todos && context.todos.length > 0) {
    const byStatus = {
      todo: context.todos.filter(t => t.status === 'todo').length,
      in_progress: context.todos.filter(t => t.status === 'in_progress').length,
      completed: context.todos.filter(t => t.status === 'completed').length,
    };
    const pending = context.todos.filter(t => t.status !== 'completed');
    const todosList = pending.slice(0, 8).map(t => 
      `  - "${t.title}" | Prioridad: ${t.priority} | Categoría: ${t.category || 'N/A'} | Vence: ${t.due_date || 'Sin fecha'}`
    ).join('\n');
    sections.push(`
## 📋 TAREAS INTERNAS (${context.todos.length} total):
- Pendientes: ${byStatus.todo}
- En progreso: ${byStatus.in_progress}
- Completadas: ${byStatus.completed}

Tareas pendientes:
${todosList || '  Ninguna'}`);
  }

  if (context.events && context.events.length > 0) {
    const upcoming = context.events.filter(e => new Date(e.start_time) >= new Date()).slice(0, 8);
    const eventsList = upcoming.map(e => 
      `  - 📅 "${e.title}" | ${e.start_time} | Proyecto: ${e.project?.name || 'General'}`
    ).join('\n');
    sections.push(`
## 📅 EVENTOS (${context.events.length} total):
Próximos eventos:
${eventsList || '  Ninguno programado'}`);
  }

  if (context.invoices && context.invoices.length > 0) {
    const byStatus = {
      paid: context.invoices.filter(i => i.status === 'paid').length,
      pending: context.invoices.filter(i => i.status === 'pending').length,
      overdue: context.invoices.filter(i => i.status === 'overdue').length,
    };
    const pendingAmount = context.invoices
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    sections.push(`
## 🧾 FACTURAS (${context.invoices.length} total):
- Pagadas: ${byStatus.paid}
- Pendientes: ${byStatus.pending}
- Vencidas: ${byStatus.overdue}
- Monto por cobrar: $${pendingAmount.toLocaleString()}`);
  }

  if (sections.length === 0) {
    return "\n\n[No se proporcionaron datos del sistema para esta consulta]";
  }

  return `\n\n=== DATOS ACTUALES DEL SISTEMA ===\nFecha de consulta: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n${sections.join('\n')}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced system prompt with real data
    let enhancedSystemPrompt = systemPrompt;
    if (dataContext) {
      enhancedSystemPrompt += formatDataContext(dataContext);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Por favor, intenta de nuevo en unos momentos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Por favor, recarga tu cuenta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al conectar con el asistente de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
