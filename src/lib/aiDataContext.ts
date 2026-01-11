import { supabase } from "@/integrations/supabase/client";

export interface DataContext {
  projects?: any[];
  clients?: any[];
  transactions?: any[];
  leads?: any[];
  tasks?: any[];
  todos?: any[];
  events?: any[];
  invoices?: any[];
  stats?: {
    totalIncome: number;
    totalExpenses: number;
    netMargin: number;
    marginPercentage: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
}

// Keywords that trigger specific data fetching
const dataKeywords = {
  projects: ['proyecto', 'proyectos', 'progress', 'progreso', 'entrega', 'entregas', 'desarrollo'],
  clients: ['cliente', 'clientes', 'customer', 'empresa', 'empresas'],
  transactions: ['transaccion', 'transacciones', 'gasto', 'gastos', 'ingreso', 'ingresos', 'pago', 'pagos'],
  finance: ['finanza', 'finanzas', 'financiero', 'dinero', 'presupuesto', 'margen', 'rentabilidad', 'flujo', 'caja'],
  leads: ['lead', 'leads', 'prospecto', 'prospectos', 'venta', 'ventas', 'oportunidad', 'oportunidades', 'pipeline'],
  tasks: ['tarea', 'tareas', 'pendiente', 'pendientes', 'prioridad', 'deadline', 'vencimiento'],
  events: ['evento', 'eventos', 'calendario', 'reunión', 'reuniones', 'cita', 'citas', 'agenda'],
  invoices: ['factura', 'facturas', 'cobrar', 'cobro', 'pagar', 'facturación'],
  all: ['reporte', 'resumen', 'dashboard', 'general', 'todo', 'completo', 'ejecutivo', 'estado'],
};

function detectRequiredData(message: string): Set<string> {
  const lowerMessage = message.toLowerCase();
  const requiredData = new Set<string>();

  // Check for 'all' keywords first
  for (const keyword of dataKeywords.all) {
    if (lowerMessage.includes(keyword)) {
      return new Set(['all']);
    }
  }

  // Check specific categories
  for (const [category, keywords] of Object.entries(dataKeywords)) {
    if (category === 'all') continue;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        requiredData.add(category);
        break;
      }
    }
  }

  // If finance-related, also include transactions and invoices
  if (requiredData.has('finance')) {
    requiredData.add('transactions');
    requiredData.add('invoices');
  }

  return requiredData;
}

async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data;
}

async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data;
}

async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      project:projects(id, name),
      client:clients(id, name)
    `)
    .order('date', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
}

async function fetchLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data;
}

async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data;
}

async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
  return data;
}

async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      project:projects(id, name)
    `)
    .order('start_time', { ascending: true })
    .limit(20);
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data;
}

async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name),
      project:projects(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
  return data;
}

async function calculateFinancialStats(transactions: any[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netMargin: income - expenses,
    marginPercentage: income > 0 ? ((income - expenses) / income * 100) : 0,
    monthlyIncome,
    monthlyExpenses,
  };
}

export async function fetchDataContext(message: string): Promise<DataContext> {
  const requiredData = detectRequiredData(message);
  const context: DataContext = {};

  const fetchAll = requiredData.has('all');

  // Parallel fetching for better performance
  const promises: Promise<void>[] = [];

  if (fetchAll || requiredData.has('projects')) {
    promises.push(
      fetchProjects().then(data => { context.projects = data; })
    );
  }

  if (fetchAll || requiredData.has('clients')) {
    promises.push(
      fetchClients().then(data => { context.clients = data; })
    );
  }

  if (fetchAll || requiredData.has('transactions') || requiredData.has('finance')) {
    promises.push(
      fetchTransactions().then(async data => { 
        context.transactions = data;
        context.stats = await calculateFinancialStats(data);
      })
    );
  }

  if (fetchAll || requiredData.has('leads')) {
    promises.push(
      fetchLeads().then(data => { context.leads = data; })
    );
  }

  if (fetchAll || requiredData.has('tasks')) {
    promises.push(
      fetchTasks().then(data => { context.tasks = data; })
    );
    promises.push(
      fetchTodos().then(data => { context.todos = data; })
    );
  }

  if (fetchAll || requiredData.has('events')) {
    promises.push(
      fetchEvents().then(data => { context.events = data; })
    );
  }

  if (fetchAll || requiredData.has('invoices')) {
    promises.push(
      fetchInvoices().then(data => { context.invoices = data; })
    );
  }

  await Promise.all(promises);

  return context;
}
