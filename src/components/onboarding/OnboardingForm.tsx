import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Building, Target, Users, AlertTriangle, Briefcase, Clock, DollarSign, Shield, Palette, StickyNote, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingRecord, useUpdateOnboarding } from "@/hooks/useOnboarding";

interface OnboardingFormProps {
  onboarding: OnboardingRecord;
  onSaved?: () => void;
}

interface FormSection {
  key: string;
  label: string;
  icon: React.ElementType;
  field: keyof OnboardingRecord;
  type: "text" | "textarea";
  placeholder: string;
}

const SECTIONS: FormSection[] = [
  { key: "company", label: "Descripción del Negocio", icon: Building, field: "company_description", type: "textarea", placeholder: "Describe el negocio del cliente..." },
  { key: "goals", label: "Objetivos del Cliente", icon: Target, field: "business_goals", type: "textarea", placeholder: "¿Qué quiere lograr el cliente?" },
  { key: "audience", label: "Público Objetivo", icon: Users, field: "target_audience", type: "textarea", placeholder: "¿A quién quiere llegar?" },
  { key: "challenges", label: "Retos Actuales", icon: AlertTriangle, field: "current_challenges", type: "textarea", placeholder: "¿Cuáles son los problemas actuales?" },
  { key: "timeline", label: "Plazos Deseados", icon: Clock, field: "timeline", type: "text", placeholder: "Ej: 3 meses, Q2 2026..." },
  { key: "budget", label: "Rango de Presupuesto", icon: DollarSign, field: "budget_range", type: "text", placeholder: "Ej: $200,000 - $400,000" },
  { key: "competitors", label: "Competencia", icon: Shield, field: "competitors", type: "textarea", placeholder: "Competidores mencionados..." },
  { key: "brand", label: "Lineamientos de Marca", icon: Palette, field: "brand_guidelines", type: "textarea", placeholder: "Preferencias de diseño, colores, estilo..." },
  { key: "notes", label: "Notas Adicionales", icon: StickyNote, field: "additional_notes", type: "textarea", placeholder: "Cualquier otra información relevante..." },
];

export function OnboardingForm({ onboarding, onSaved }: OnboardingFormProps) {
  const updateOnboarding = useUpdateOnboarding();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(SECTIONS.map(s => s.key)));

  useEffect(() => {
    const data: Record<string, string> = {};
    SECTIONS.forEach(s => {
      data[s.field] = (onboarding[s.field] as string) || "";
    });
    setFormData(data);
  }, [onboarding]);

  const handleSave = () => {
    updateOnboarding.mutate({
      id: onboarding.id,
      ...Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v || null])
      ),
    }, {
      onSuccess: () => onSaved?.(),
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filledCount = SECTIONS.filter(s => formData[s.field]?.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filledCount}/{SECTIONS.length} campos completados</Badge>
          {onboarding.status === "completed" && (
            <Badge className="bg-success/20 text-success border-success/30">IA Procesado</Badge>
          )}
        </div>
        <Button onClick={handleSave} disabled={updateOnboarding.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          Guardar
        </Button>
      </div>

      {/* Services Section */}
      {onboarding.requested_services && (onboarding.requested_services as any[]).length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Servicios Identificados</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {(onboarding.requested_services as any[]).map((svc: any, i: number) => (
              <div key={i} className="glass rounded-lg p-3 flex-1 min-w-[200px]">
                <Badge variant="outline" className="mb-1">{svc.service}</Badge>
                <p className="text-sm mt-1">{svc.description}</p>
                {svc.estimated_price && (
                  <p className="text-xs text-primary font-medium mt-1">
                    ${svc.estimated_price.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-2">
        {SECTIONS.map(section => (
          <Collapsible key={section.key} open={openSections.has(section.key)} onOpenChange={() => toggleSection(section.key)}>
            <CollapsibleTrigger asChild>
              <button className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                "hover:bg-secondary/50",
                formData[section.field]?.trim() ? "bg-secondary/30" : "bg-secondary/10"
              )}>
                <div className="flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{section.label}</span>
                  {formData[section.field]?.trim() && (
                    <div className="w-2 h-2 rounded-full bg-success" />
                  )}
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.has(section.key) && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {section.type === "textarea" ? (
                <Textarea
                  value={formData[section.field] || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, [section.field]: e.target.value }))}
                  placeholder={section.placeholder}
                  className="mt-2 min-h-[100px]"
                />
              ) : (
                <Input
                  value={formData[section.field] || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, [section.field]: e.target.value }))}
                  placeholder={section.placeholder}
                  className="mt-2"
                />
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
