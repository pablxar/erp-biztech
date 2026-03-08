import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  CheckCircle2,
  CreditCard,
  Loader2,
  ArrowRight,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, useUpdateProject } from "@/hooks/useProjects";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { formatCurrency, PAYMENT_STATUS_CONFIG } from "@/lib/servicePricing";
import { format } from "date-fns";
import { toast } from "sonner";

interface RegisterPaymentDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousPayments: number;
}

type PaymentType = "full" | "partial";

export function RegisterPaymentDialog({
  project,
  open,
  onOpenChange,
  previousPayments,
}: RegisterPaymentDialogProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>("full");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: createTransaction } = useCreateTransaction();

  const agreedPrice = Number(project.budget) || 0;
  const remaining = agreedPrice - previousPayments;

  const handleSubmit = async () => {
    const paymentAmount =
      paymentType === "full" ? remaining : parseFloat(amount) || 0;

    if (paymentAmount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (paymentAmount > remaining) {
      toast.error(`El monto no puede superar el saldo restante (${formatCurrency(remaining)})`);
      return;
    }

    setIsSubmitting(true);

    try {
      const isFullPayment =
        paymentType === "full" || paymentAmount >= remaining;
      const newStatus = isFullPayment ? "paid" : "partial";
      const totalPaid = previousPayments + paymentAmount;

      await updateProject({
        id: project.id,
        payment_status: newStatus,
        payment_details: {
          ...(project.payment_details || {}),
          partialAmount: isFullPayment ? undefined : totalPaid,
        },
      });

      await createTransaction({
        description: isFullPayment
          ? `Cobro proyecto: ${project.name}${previousPayments > 0 ? " (saldo final)" : ""}`
          : `Abono proyecto: ${project.name}`,
        amount: paymentAmount,
        type: "income",
        category: "Proyectos",
        project_id: project.id,
        client_id: project.client_id || undefined,
        date: format(new Date(), "yyyy-MM-dd"),
      });

      toast.success(
        isFullPayment
          ? "Pago completo registrado"
          : `Abono de ${formatCurrency(paymentAmount)} registrado`
      );
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaymentType("full");
    setAmount("");
    setNote("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <Banknote className="w-5 h-5 text-success" />
            </div>
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Registra un cobro para el proyecto{" "}
            <span className="font-medium text-foreground">
              {project.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Summary card */}
          <div className="rounded-xl bg-secondary/50 border border-border/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Precio acordado</span>
              <span className="font-semibold">{formatCurrency(agreedPrice)}</span>
            </div>
            {previousPayments > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ya cobrado</span>
                <span className="font-medium text-success">
                  {formatCurrency(previousPayments)}
                </span>
              </div>
            )}
            <div className="border-t border-border/50 pt-2 flex items-center justify-between text-sm">
              <span className="font-medium">Saldo restante</span>
              <span className="font-bold text-lg">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Payment type selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de pago</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                  paymentType === "full"
                    ? "border-success bg-success/10 ring-1 ring-success"
                    : "border-border hover:border-success/50 hover:bg-secondary/50"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "w-6 h-6",
                    paymentType === "full"
                      ? "text-success"
                      : "text-muted-foreground"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      paymentType === "full" && "text-success"
                    )}
                  >
                    Pago Completo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("partial")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                  paymentType === "partial"
                    ? "border-info bg-info/10 ring-1 ring-info"
                    : "border-border hover:border-info/50 hover:bg-secondary/50"
                )}
              >
                <CreditCard
                  className={cn(
                    "w-6 h-6",
                    paymentType === "partial"
                      ? "text-info"
                      : "text-muted-foreground"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      paymentType === "partial" && "text-info"
                    )}
                  >
                    Abono Parcial
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monto personalizado
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount input for partial */}
          {paymentType === "partial" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="payment-amount">Monto del abono ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remaining}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 text-lg font-medium"
                  autoFocus
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Restante después del abono:{" "}
                  <span className="font-medium">
                    {formatCurrency(remaining - (parseFloat(amount) || 0))}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="payment-note">Nota (opcional)</Label>
            <Textarea
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalle del pago..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (paymentType === "partial" && (!amount || parseFloat(amount) <= 0))
              }
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Registrar Pago
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
