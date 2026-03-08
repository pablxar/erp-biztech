import { useState } from 'react';
import { useCreateProject, ServiceType } from '@/hooks/useProjects';
import { useClients, useCreateClient } from '@/hooks/useClients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Plus,
  Loader2,
  CalendarIcon,
  Code2,
  Megaphone,
  Video,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Briefcase,
  Users,
  DollarSign,
  Building,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingSection } from './PricingSection';
import {
  PaymentMode,
  PaymentStatus,
  PaymentDetails,
  SERVICE_PRICING,
  formatCurrency,
} from '@/lib/servicePricing';

interface Props {
  trigger?: React.ReactNode;
}

const serviceTypes = [
  { value: 'software_development', label: 'Desarrollo de Software', icon: Code2, description: 'ERP, CRM, SCM, Apps Internas', color: 'text-primary', bgColor: 'bg-primary/10' },
  { value: 'digital_marketing', label: 'Marketing Digital', icon: Megaphone, description: 'Meta Ads, Google Ads, Email Marketing', color: 'text-success', bgColor: 'bg-success/10' },
  { value: 'audiovisual', label: 'Audiovisual', icon: Video, description: 'Videos, Fotografía y Contenido Visual', color: 'text-warning', bgColor: 'bg-warning/10' },
  { value: 'web_development', label: 'Web Development', icon: Globe, description: 'E-commerce y Landing Pages', color: 'text-info', bgColor: 'bg-info/10' },
];

const steps = [
  { id: 1, label: 'Proyecto', icon: FileText },
  { id: 2, label: 'Servicio', icon: Briefcase },
  { id: 3, label: 'Cliente', icon: Users },
  { id: 4, label: 'Precio', icon: DollarSign },
];

export function CreateProjectDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1: Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'active' | 'on_hold' | 'completed'>('pending');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Step 2: Service
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');

  // Step 3: Client
  const [clientId, setClientId] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });

  // Step 4: Pricing
  const [budget, setBudget] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [referencePrice, setReferencePrice] = useState(0);
  const [markAsPending, setMarkAsPending] = useState(true);

  const { mutate: createProject, isPending } = useCreateProject();
  const { data: clients } = useClients();
  const { mutateAsync: createClient, isPending: isCreatingClient } = useCreateClient();

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setStatus('pending');
    setStartDate(undefined);
    setEndDate(undefined);
    setServiceType('');
    setClientId('');
    setShowNewClient(false);
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setBudget('');
    setPaymentMode('');
    setPaymentStatus('pending');
    setPaymentDetails({});
    setReferencePrice(0);
    setMarkAsPending(true);
  };

  const handleServiceTypeChange = (value: ServiceType) => {
    setServiceType(value);
    const config = SERVICE_PRICING[value];
    if (config) {
      setPaymentMode(config.paymentMode);
      setPaymentDetails({});
    }
  };

  const handleCreateInlineClient = async () => {
    if (!newClient.name) return;
    try {
      const created = await createClient({
        name: newClient.name,
        company: newClient.company || undefined,
        email: newClient.email || undefined,
        phone: newClient.phone || undefined,
      });
      setClientId(created.id);
      setShowNewClient(false);
      setNewClient({ name: '', company: '', email: '', phone: '' });
    } catch {
      // error handled by hook
    }
  };

  const handleSubmit = () => {
    createProject(
      {
        name,
        description: description || undefined,
        client_id: clientId || undefined,
        status,
        service_type: serviceType || undefined,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        payment_status: (markAsPending && parseFloat(budget) > 0) ? 'pending' : undefined,
        payment_mode: paymentMode || undefined,
        reference_price: referencePrice || undefined,
        payment_details: Object.keys(paymentDetails).length > 0 ? paymentDetails : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      }
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!name.trim();
      case 2: return true; // service type is optional
      case 3: return true; // client is optional
      case 4: return true;
      default: return false;
    }
  };

  const selectedClient = clients?.find(c => c.id === clientId);
  const selectedService = serviceType ? serviceTypes.find(s => s.value === serviceType) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden gap-0">
        {/* Header with stepper */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 border-b border-border/50 p-6 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nuevo Proyecto</h2>
              <p className="text-xs text-muted-foreground">Paso {step} de {steps.length}</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => { if (isDone) setStep(s.id); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium w-full",
                      isActive && "bg-primary text-primary-foreground shadow-md",
                      isDone && "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20",
                      !isActive && !isDone && "bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="hidden sm:inline truncate">{s.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Project Info */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="space-y-2">
                <Label htmlFor="wizard-name" className="text-sm font-medium">Nombre del Proyecto *</Label>
                <Input
                  id="wizard-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Rediseño Web para Empresa X"
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wizard-desc" className="text-sm font-medium">Descripción</Label>
                <Textarea
                  id="wizard-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe brevemente el alcance del proyecto..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado inicial</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="on_hold">En Espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fecha Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "d MMM yyyy", { locale: es }) : "Sin fecha límite"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Step 2: Service Type */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h3 className="font-semibold mb-1">Tipo de Servicio</h3>
                <p className="text-sm text-muted-foreground">Selecciona el servicio asociado al proyecto (opcional)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = serviceType === type.value;
                  const pricing = SERVICE_PRICING[type.value as ServiceType];
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleServiceTypeChange(type.value as ServiceType)}
                      className={cn(
                        "relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
                          : "border-border hover:border-primary/40 hover:bg-secondary/30"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", type.bgColor)}>
                        <Icon className={cn("w-5 h-5", type.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-sm font-semibold", isSelected && "text-primary")}>{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                        {pricing && (
                          <p className="text-xs font-medium text-primary/80 mt-1.5">
                            {pricing.paymentMode === 'percentage'
                              ? '% por resultado'
                              : pricing.paymentMode === 'per_unit'
                                ? `${formatCurrency(pricing.basePrice)}/video`
                                : pricing.hasSubtype
                                  ? `Desde ${formatCurrency(pricing.basePrice)}`
                                  : formatCurrency(pricing.basePrice)
                            }
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {serviceType && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  El precio se configurará en el siguiente paso
                </div>
              )}
            </div>
          )}

          {/* Step 3: Client */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h3 className="font-semibold mb-1">Cliente</h3>
                <p className="text-sm text-muted-foreground">Asocia un cliente existente o crea uno nuevo (opcional)</p>
              </div>

              {!showNewClient ? (
                <div className="space-y-3">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{client.name}</span>
                            {client.company && <span className="text-muted-foreground text-xs">· {client.company}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {clientId && selectedClient && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">{selectedClient.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{selectedClient.name}</p>
                        {selectedClient.company && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {selectedClient.company}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setClientId('')} className="text-xs text-muted-foreground">
                        Cambiar
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-3 text-xs text-muted-foreground">o</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 h-12 border-dashed"
                    onClick={() => setShowNewClient(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Crear nuevo cliente
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-primary" />
                      Nuevo Cliente
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewClient(false)} className="text-xs">
                      Cancelar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nombre *</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="Nombre completo"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Empresa</Label>
                      <Input
                        value={newClient.company}
                        onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                        placeholder="Nombre de empresa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Teléfono</Label>
                      <Input
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateInlineClient}
                    disabled={!newClient.name || isCreatingClient}
                    className="w-full gap-2"
                  >
                    {isCreatingClient ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Crear y Seleccionar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h3 className="font-semibold mb-1">Precio y Cobro</h3>
                <p className="text-sm text-muted-foreground">Configura el precio acordado del proyecto</p>
              </div>

              <PricingSection
                serviceType={serviceType}
                budget={budget}
                onBudgetChange={setBudget}
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
                paymentStatus={paymentStatus}
                onPaymentStatusChange={setPaymentStatus}
                paymentDetails={paymentDetails}
                onPaymentDetailsChange={setPaymentDetails}
                referencePrice={referencePrice}
                onReferencePriceChange={setReferencePrice}
                markAsPending={markAsPending}
                onMarkAsPendingChange={setMarkAsPending}
                hidePaymentStatus
              />

              {/* Review summary */}
              <div className="rounded-xl border border-border/50 bg-secondary/20 divide-y divide-border/50">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Resumen del proyecto</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proyecto</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Servicio</span>
                      <span className="font-medium">{selectedService.label}</span>
                    </div>
                  )}
                  {selectedClient && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cliente</span>
                      <span className="font-medium">{selectedClient.name}</span>
                    </div>
                  )}
                  {budget && parseFloat(budget) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio Acordado</span>
                      <span className="font-bold text-primary">{formatCurrency(parseFloat(budget))}</span>
                    </div>
                  )}
                  {startDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio</span>
                      <span>{format(startDate, "d MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fin</span>
                      <span>{format(endDate, "d MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border/50 bg-secondary/10 flex items-center gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2 min-w-[140px]"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="gap-2 min-w-[160px]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Crear Proyecto
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
