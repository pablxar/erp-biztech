import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  ArrowRight,
  Building,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Check,
  Zap,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { useCreateClient } from "@/hooks/useClients";
import { useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConvertLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertLeadDialog({ lead, open, onOpenChange }: ConvertLeadDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [convertedClientId, setConvertedClientId] = useState<string | null>(null);
  const [convertedClientName, setConvertedClientName] = useState("");

  const createClient = useCreateClient();
  const updateLead = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setName(lead.name || "");
      setCompany(lead.company || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setAddress("");
      setNotes(lead.notes || "");
      setConvertedClientId(null);
      setConvertedClientName("");
    }
  }, [lead]);

  const prefilledFields = lead
    ? [
        lead.name && "Nombre",
        lead.company && "Empresa",
        lead.email && "Email",
        lead.phone && "Teléfono",
      ].filter(Boolean)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead) return;

    if (!name.trim()) {
      toast.error("El nombre del cliente es requerido");
      return;
    }

    createClient.mutate(
      {
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setConvertedClientId(data.id);
          setConvertedClientName(data.name);
          updateLead.mutate(
            {
              id: lead.id,
              status: "converted",
              converted_at: new Date().toISOString(),
            },
            {
              onSuccess: () => {
                toast.success("🎉 Lead convertido y cliente creado exitosamente");
              },
              onError: () => {
                toast.error("Cliente creado pero hubo un error al actualizar el lead");
              },
            }
          );
        },
        onError: () => {
          toast.error("Error al crear el cliente");
        },
      }
    );
  };

  const handleGoToClient = () => {
    onOpenChange(false);
    navigate("/clients");
  };

  const isSubmitting = createClient.isPending || updateLead.isPending;

  // Success state
  if (convertedClientId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-emerald-500/15 via-primary/10 to-transparent px-6 pt-8 pb-6 text-center">
            <div className="absolute top-0 left-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="relative space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">¡Cliente creado!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{convertedClientName}</span> ahora es un cliente activo
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex flex-col gap-3">
            <Button
              onClick={handleGoToClient}
              className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-700 hover:to-primary/90"
            >
              <ExternalLink className="w-4 h-4" />
              Ver cliente
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-violet-500/15 via-primary/10 to-transparent px-6 pt-6 pb-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-xl">Convertir Lead a Cliente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Revisa y completa los datos para crear el nuevo cliente
            </DialogDescription>
          </DialogHeader>

          {prefilledFields.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-muted-foreground">Pre-llenado:</span>
              {prefilledFields.map((field) => (
                <Badge
                  key={field as string}
                  variant="secondary"
                  className="text-xs gap-1 bg-violet-500/10 text-violet-300 border-violet-500/20"
                >
                  <Check className="w-3 h-3" />
                  {field}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Name - required */}
          <div className="space-y-2">
            <Label htmlFor="convert-name" className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
              Nombre del cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="convert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              required
              className={cn(
                "transition-all",
                name && "border-violet-500/40 bg-violet-500/5"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="convert-company" className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                Empresa
              </Label>
              <Input
                id="convert-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de empresa"
                className={cn(
                  "transition-all",
                  company && "border-violet-500/40 bg-violet-500/5"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="convert-email" className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="convert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className={cn(
                  "transition-all",
                  email && "border-violet-500/40 bg-violet-500/5"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="convert-phone" className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Teléfono
              </Label>
              <Input
                id="convert-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className={cn(
                  "transition-all",
                  phone && "border-violet-500/40 bg-violet-500/5"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="convert-address" className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Dirección
              </Label>
              <Input
                id="convert-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ciudad, País"
                className={cn(
                  "transition-all",
                  address && "border-violet-500/40 bg-violet-500/5"
                )}
              />
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-2">
            <Label htmlFor="convert-notes">Notas adicionales</Label>
            <Textarea
              id="convert-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información relevante del cliente..."
              rows={3}
              className={cn(
                "transition-all resize-none",
                notes && "border-violet-500/40 bg-violet-500/5"
              )}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-violet-600 to-primary hover:from-violet-700 hover:to-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cliente...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Convertir y crear cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}