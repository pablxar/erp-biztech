import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, Film, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceType } from '@/hooks/useProjects';
import {
  SERVICE_PRICING,
  PaymentMode,
  PaymentStatus,
  PaymentDetails,
  WebSubtype,
  getDefaultPriceForService,
  formatCurrency,
  PAYMENT_STATUS_CONFIG,
} from '@/lib/servicePricing';

interface PricingSectionProps {
  serviceType: ServiceType | '';
  budget: string;
  onBudgetChange: (value: string) => void;
  paymentMode: PaymentMode | '';
  onPaymentModeChange: (value: PaymentMode) => void;
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (value: PaymentStatus) => void;
  paymentDetails: PaymentDetails;
  onPaymentDetailsChange: (value: PaymentDetails) => void;
  referencePrice: number;
  onReferencePriceChange: (value: number) => void;
  markAsPending: boolean;
  onMarkAsPendingChange: (value: boolean) => void;
  hidePaymentStatus?: boolean;
}

export function PricingSection({
  serviceType,
  budget,
  onBudgetChange,
  paymentMode,
  onPaymentModeChange,
  paymentStatus,
  onPaymentStatusChange,
  paymentDetails,
  onPaymentDetailsChange,
  referencePrice,
  onReferencePriceChange,
  markAsPending,
  onMarkAsPendingChange,
  hidePaymentStatus,
}: PricingSectionProps) {
  const config = serviceType ? SERVICE_PRICING[serviceType as ServiceType] : null;

  // Auto-set payment mode when service changes
  useEffect(() => {
    if (config && !paymentMode) {
      onPaymentModeChange(config.paymentMode);
    }
  }, [serviceType]);

  // Track previous service type to detect actual changes
  const [prevServiceType, setPrevServiceType] = useState(serviceType);
  const [prevWebSubtype, setPrevWebSubtype] = useState(paymentDetails?.web_subtype);
  const [prevVideoCount, setPrevVideoCount] = useState(paymentDetails?.video_count);

  // Auto-calculate reference price when service/details change — only update budget on actual user changes
  useEffect(() => {
    if (serviceType) {
      const price = getDefaultPriceForService(serviceType as ServiceType, paymentDetails);
      onReferencePriceChange(price);
      
      const serviceChanged = serviceType !== prevServiceType;
      const subtypeChanged = paymentDetails?.web_subtype !== prevWebSubtype;
      const videoCountChanged = paymentDetails?.video_count !== prevVideoCount;
      
      if ((serviceChanged || subtypeChanged || videoCountChanged) && config?.paymentMode !== 'percentage') {
        onBudgetChange(price.toString());
      }
      
      setPrevServiceType(serviceType);
      setPrevWebSubtype(paymentDetails?.web_subtype);
      setPrevVideoCount(paymentDetails?.video_count);
    }
  }, [serviceType, paymentDetails?.web_subtype, paymentDetails?.video_count]);

  if (!serviceType || !config) {
    return (
      <div className="space-y-2">
        <Label htmlFor="agreed-price">Precio Acordado ($)</Label>
        <Input
          id="agreed-price"
          type="number"
          step="0.01"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-secondary/20 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Pricing del Servicio
        </Label>
        <Badge variant="outline" className="text-xs">
          {config.label}
        </Badge>
      </div>

      {/* Web Development sub-selector */}
      {config.hasSubtype && config.subtypes && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tipo de Sitio Web</Label>
          <div className="grid grid-cols-2 gap-2">
            {config.subtypes.map((sub) => {
              const isSelected = paymentDetails.web_subtype === sub.value;
              return (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() =>
                    onPaymentDetailsChange({ ...paymentDetails, web_subtype: sub.value })
                  }
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Globe className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className={cn('font-medium', isSelected && 'text-primary')}>{sub.label}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(sub.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Audiovisual: video count */}
      {config.paymentMode === 'per_unit' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              Cantidad de Videos
            </Label>
            <Input
              type="number"
              min="1"
              value={paymentDetails.video_count ?? 1}
              onChange={(e) =>
                onPaymentDetailsChange({
                  ...paymentDetails,
                  video_count: parseInt(e.target.value) || 1,
                  price_per_video: paymentDetails.price_per_video ?? config.basePrice,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Precio por Video</Label>
            <Input
              type="number"
              value={paymentDetails.price_per_video ?? config.basePrice}
              onChange={(e) =>
                onPaymentDetailsChange({
                  ...paymentDetails,
                  price_per_video: parseFloat(e.target.value) || config.basePrice,
                })
              }
            />
          </div>
        </div>
      )}

      {/* Marketing: percentage */}
      {config.paymentMode === 'percentage' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" />
            Porcentaje Growth Partner
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={paymentDetails.percentage ?? 15}
              onChange={(e) =>
                onPaymentDetailsChange({
                  ...paymentDetails,
                  percentage: parseFloat(e.target.value) || 0,
                  description: 'Growth Partner',
                })
              }
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">% por resultado</span>
          </div>
        </div>
      )}

      {/* Reference price display + editable budget */}
      <div className="space-y-2">
        {config.paymentMode !== 'percentage' && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Precio referencial:</span>
            <span className="font-medium">{formatCurrency(referencePrice)}</span>
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">
            {config.paymentMode === 'percentage' ? 'Monto Estimado (opcional)' : 'Precio Acordado ($)'}
          </Label>
          <Input
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
            placeholder={config.paymentMode === 'percentage' ? 'Opcional' : '0.00'}
          />
        </div>
      </div>

      {/* Payment status selector (for edit mode) */}
      {paymentStatus && !hidePaymentStatus && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estado de Pago</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => onPaymentStatusChange(v as PaymentStatus)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Partial amount input */}
          {paymentStatus === 'partial' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Monto Abonado ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={paymentDetails.partialAmount ?? ''}
                onChange={(e) =>
                  onPaymentDetailsChange({
                    ...paymentDetails,
                    partialAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Monto del abono"
              />
              {budget && paymentDetails.partialAmount ? (
                <p className="text-xs text-muted-foreground">
                  Restante: {formatCurrency(parseFloat(budget) - (paymentDetails.partialAmount || 0))}
                </p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Mark as pending checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="mark-pending"
          checked={markAsPending}
          onCheckedChange={(v) => onMarkAsPendingChange(v === true)}
        />
        <Label htmlFor="mark-pending" className="text-sm cursor-pointer">
          Marcar como Por Pagar
        </Label>
      </div>
    </div>
  );
}
