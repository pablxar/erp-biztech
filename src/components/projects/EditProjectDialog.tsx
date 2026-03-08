import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2, Code2, Megaphone, Video, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Project, useUpdateProject, ServiceType } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { PricingSection } from "./PricingSection";
import { PaymentMode, PaymentStatus, PaymentDetails, SERVICE_PRICING, formatCurrency } from "@/lib/servicePricing";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const serviceTypes = [
  { value: 'software_development', label: 'Desarrollo de Software', icon: Code2, description: 'ERP, CRM, SCM, Apps Internas' },
  { value: 'digital_marketing', label: 'Marketing Digital', icon: Megaphone, description: 'Meta Ads, Google Ads, Email Marketing' },
  { value: 'audiovisual', label: 'Audiovisual', icon: Video, description: 'Videos, Fotografía y Contenido Visual' },
  { value: 'web_development', label: 'Web Development', icon: Globe, description: 'E-commerce y Landing Pages' },
];

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client_id: "",
    status: "pending" as Project["status"],
    service_type: "" as ServiceType | "",
    budget: "",
    progress: 0,
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Pricing state
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [referencePrice, setReferencePrice] = useState(0);
  const [markAsPending, setMarkAsPending] = useState(true);

  const { mutate: updateProject, isPending } = useUpdateProject();
  const { mutate: createTransaction } = useCreateTransaction();
  const { data: clients } = useClients();

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        client_id: project.client_id || "",
        status: project.status,
        service_type: project.service_type || "",
        budget: project.budget?.toString() || "",
        progress: project.progress || 0,
      });
      setStartDate(project.start_date ? new Date(project.start_date) : undefined);
      setEndDate(project.end_date ? new Date(project.end_date) : undefined);
      setPaymentMode((project.payment_mode as PaymentMode) || '');
      setPaymentStatus((project.payment_status as PaymentStatus) || 'pending');
      setPaymentDetails((project.payment_details as PaymentDetails) || {});
      setReferencePrice(Number(project.reference_price) || 0);
      setMarkAsPending(project.payment_status === 'pending' || project.payment_status === 'partial');
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const newPaymentStatus = markAsPending ? paymentStatus : 'paid';
    const oldPaymentStatus = project.payment_status;
    const agreedPrice = formData.budget ? parseFloat(formData.budget) : 0;

    updateProject(
      {
        id: project.id,
        name: formData.name,
        description: formData.description || null,
        client_id: formData.client_id || null,
        status: formData.status,
        service_type: formData.service_type || null,
        start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
        end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        budget: agreedPrice,
        progress: formData.progress,
        payment_status: newPaymentStatus,
        payment_mode: paymentMode || null,
        reference_price: referencePrice || 0,
        payment_details: Object.keys(paymentDetails).length > 0 ? paymentDetails : {},
      },
      {
        onSuccess: () => {
          // Auto-register income when payment status changes to paid or partial
          if (agreedPrice > 0 && oldPaymentStatus !== newPaymentStatus) {
            if (newPaymentStatus === 'paid' && oldPaymentStatus !== 'paid') {
              // Full payment: register full amount (minus any partial already registered)
              const previousPartial = oldPaymentStatus === 'partial' 
                ? Number((paymentDetails as any).partialAmount || 0) 
                : 0;
              const incomeAmount = agreedPrice - previousPartial;
              if (incomeAmount > 0) {
                createTransaction({
                  description: `Cobro proyecto: ${formData.name}${previousPartial > 0 ? ' (saldo restante)' : ''}`,
                  amount: incomeAmount,
                  type: 'income',
                  category: 'Proyectos',
                  project_id: project.id,
                  client_id: formData.client_id || undefined,
                  date: format(new Date(), 'yyyy-MM-dd'),
                });
              }
            } else if (newPaymentStatus === 'partial' && oldPaymentStatus !== 'partial' && oldPaymentStatus !== 'paid') {
              // Partial payment: register partial amount
              const partialAmount = Number(paymentDetails.partialAmount || 0);
              if (partialAmount > 0) {
                createTransaction({
                  description: `Abono proyecto: ${formData.name}`,
                  amount: partialAmount,
                  type: 'income',
                  category: 'Proyectos',
                  project_id: project.id,
                  client_id: formData.client_id || undefined,
                  date: format(new Date(), 'yyyy-MM-dd'),
                });
              }
            }
          }
          onOpenChange(false);
        },
      }
    );
  };

  const handleServiceTypeChange = (value: ServiceType) => {
    setFormData({ ...formData, service_type: value });
    const config = SERVICE_PRICING[value];
    if (config) {
      setPaymentMode(config.paymentMode);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del Proyecto *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Rediseño Web"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del proyecto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Servicio</Label>
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
              <Label>Cliente</Label>
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
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Project["status"]) => setFormData({ ...formData, status: value })}
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
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar"}
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
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar"}
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

          <div className="space-y-2">
            <Label htmlFor="edit-progress">Progreso (%)</Label>
            <Input
              id="edit-progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.name}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
