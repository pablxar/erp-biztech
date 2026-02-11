import { useState } from 'react';
import { useCreateProject, ServiceType } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Loader2, CalendarIcon, Code2, Megaphone, Video, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingSection } from './PricingSection';
import { PaymentMode, PaymentStatus, PaymentDetails, SERVICE_PRICING, formatCurrency } from '@/lib/servicePricing';

interface Props {
  trigger?: React.ReactNode;
}

const serviceTypes = [
  { value: 'software_development', label: 'Desarrollo de Software', icon: Code2, description: 'ERP, CRM, SCM, Apps Internas' },
  { value: 'digital_marketing', label: 'Marketing Digital', icon: Megaphone, description: 'Meta Ads, Google Ads, Email Marketing' },
  { value: 'audiovisual', label: 'Audiovisual', icon: Video, description: 'Videos, Fotografía y Contenido Visual' },
  { value: 'web_development', label: 'Web Development', icon: Globe, description: 'E-commerce y Landing Pages' },
];

export function CreateProjectDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'pending' as const,
    service_type: '' as ServiceType | '',
    budget: '',
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Pricing state
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [referencePrice, setReferencePrice] = useState(0);
  const [markAsPending, setMarkAsPending] = useState(true);

  const { mutate: createProject, isPending } = useCreateProject();
  const { data: clients } = useClients();

  const resetForm = () => {
    setFormData({ name: '', description: '', client_id: '', status: 'pending', service_type: '', budget: '' });
    setStartDate(undefined);
    setEndDate(undefined);
    setPaymentMode('');
    setPaymentStatus('pending');
    setPaymentDetails({});
    setReferencePrice(0);
    setMarkAsPending(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject(
      {
        name: formData.name,
        description: formData.description || undefined,
        client_id: formData.client_id || undefined,
        status: formData.status,
        service_type: formData.service_type || undefined,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        payment_status: markAsPending ? 'pending' : 'paid',
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

  const handleServiceTypeChange = (value: ServiceType) => {
    setFormData({ ...formData, service_type: value });
    const config = SERVICE_PRICING[value];
    if (config) {
      setPaymentMode(config.paymentMode);
      setPaymentDetails({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Rediseño Web"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del proyecto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Servicio *</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.service_type === type.value;
                const pricing = SERVICE_PRICING[type.value as ServiceType];
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleServiceTypeChange(type.value as ServiceType)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                      isSelected 
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary/20" : "bg-secondary"
                    )}>
                      <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", isSelected && "text-primary")}>{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                      {pricing && (
                        <p className="text-xs font-medium text-primary/80 mt-1">
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
          </div>

          {/* Pricing Section */}
          <PricingSection
            serviceType={formData.service_type}
            budget={formData.budget}
            onBudgetChange={(v) => setFormData({ ...formData, budget: v })}
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
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="on_hold">En Espera</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.name}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
