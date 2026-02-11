import { ServiceType } from '@/hooks/useProjects';

export type PaymentMode = 'fixed' | 'percentage' | 'per_unit';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export type WebSubtype = 'landing_page' | 'ecommerce';

export interface PaymentDetails {
  video_count?: number;
  price_per_video?: number;
  percentage?: number;
  description?: string;
  web_subtype?: WebSubtype;
}

export interface ServicePricingConfig {
  label: string;
  basePrice: number;
  paymentMode: PaymentMode;
  description: string;
  hasSubtype?: boolean;
  subtypes?: { value: WebSubtype; label: string; price: number }[];
}

export const SERVICE_PRICING: Record<ServiceType, ServicePricingConfig> = {
  software_development: {
    label: 'Desarrollo de Software',
    basePrice: 300000,
    paymentMode: 'fixed',
    description: 'Precio base para desarrollo de software',
  },
  web_development: {
    label: 'Web Development',
    basePrice: 200000,
    paymentMode: 'fixed',
    description: 'Precio según tipo de sitio',
    hasSubtype: true,
    subtypes: [
      { value: 'landing_page', label: 'Landing Page', price: 200000 },
      { value: 'ecommerce', label: 'E-commerce', price: 400000 },
    ],
  },
  digital_marketing: {
    label: 'Marketing Digital',
    basePrice: 0,
    paymentMode: 'percentage',
    description: 'Growth Partner - % por resultado',
  },
  audiovisual: {
    label: 'Audiovisual',
    basePrice: 5000,
    paymentMode: 'per_unit',
    description: '$5,000 por video editado',
  },
};

export function getDefaultPriceForService(
  serviceType: ServiceType,
  details?: PaymentDetails
): number {
  const config = SERVICE_PRICING[serviceType];
  if (!config) return 0;

  switch (config.paymentMode) {
    case 'fixed':
      if (config.hasSubtype && details?.web_subtype) {
        const subtype = config.subtypes?.find(s => s.value === details.web_subtype);
        return subtype?.price ?? config.basePrice;
      }
      return config.basePrice;
    case 'per_unit':
      return (details?.video_count ?? 1) * (details?.price_per_video ?? config.basePrice);
    case 'percentage':
      return 0;
    default:
      return config.basePrice;
  }
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`;
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Por Pagar', color: 'bg-warning/20 text-warning border-warning/30' },
  partial: { label: 'Pago Parcial', color: 'bg-info/20 text-info border-info/30' },
  paid: { label: 'Pagado', color: 'bg-success/20 text-success border-success/30' },
};
