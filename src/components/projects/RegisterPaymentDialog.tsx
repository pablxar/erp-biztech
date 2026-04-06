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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  CheckCircle2,
  CreditCard,
  Loader2,
  ArrowRight,
  Banknote,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, useUpdateProject } from "@/hooks/useProjects";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/servicePricing";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

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
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select");

  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: createTransaction } = useCreateTransaction();

  const agreedPrice = Number(project.budget) || 0;
  const remaining = agreedPrice - previousPayments;
  const progressPercent = agreedPrice > 0 ? (previousPayments / agreedPrice) * 100 : 0;

  const paymentAmount = paymentType === "full" ? remaining : parseFloat(amount) || 0;
  const newProgressPercent = agreedPrice > 0 ? ((previousPayments + paymentAmount) / agreedPrice) * 100 : 0;

  const handleSubmit = async () => {
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
      const isFullPayment = paymentType === "full" || paymentAmount >= remaining;
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
        description: note
          ? `${isFullPayment ? "Cobro" : "Abono"} proyecto: ${project.name} — ${note}`
          : isFullPayment
            ? `Cobro proyecto: ${project.name}${previousPayments > 0 ? " (saldo final)" : ""}`
            : `Abono proyecto: ${project.name}`,
        amount: paymentAmount,
        type: "income",
        category: "Proyectos",
        project_id: project.id,
        client_id: project.client_id || undefined,
        date: format(paymentDate, "yyyy-MM-dd"),
      });

      toast.success(
        isFullPayment
          ? "🎉 ¡Pago completo registrado!"
          : `Abono de ${formatCurrency(paymentAmount)} registrado`
      );
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error("Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaymentType("full");
    setAmount("");
    setNote("");
    setPaymentDate(new Date());
    setStep("select");
  };

  const canProceed = paymentType === "full" || (parseFloat(amount) > 0 && parseFloat(amount) <= remaining);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-success/5 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              Registrar Cobro
            </DialogTitle>
            <DialogDescription className="mt-1">
              {project.name}
              {project.clients && (
                <span className="text-muted-foreground"> · {project.clients.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Mini progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso de cobro</span>
              <span className="font-semibold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cobrado: <span className="font-medium text-success">{formatCurrency(previousPayments)}</span></span>
              <span>Total: <span className="font-medium text-foreground">{formatCurrency(agreedPrice)}</span></span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-5">
          {step === "select" ? (
            <>
              {/* Remaining balance highlight */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                <div className="p-2 rounded-lg bg-warning/10">
                  <DollarSign className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(remaining)}</p>
                </div>
              </div>

              {/* Payment type selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de cobro</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("full")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center group",
                      paymentType === "full"
                        ? "border-success bg-success/5 shadow-[0_0_20px_hsl(var(--success)/0.1)]"
                        : "border-border hover:border-success/40 hover:bg-success/5"
                    )}
                  >
                    {paymentType === "full" && (
                      <div className="absolute -top-2 -right-2 p-1 rounded-full bg-success">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-foreground" />
                      </div>
                    )}
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      paymentType === "full" ? "bg-success/10" : "bg-secondary"
                    )}>
                      <Sparkles className={cn(
                        "w-6 h-6",
                        paymentType === "full" ? "text-success" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-semibold",
                        paymentType === "full" && "text-success"
                      )}>
                        Pago Completo
                      </p>
                      <p className="text-lg font-bold mt-0.5">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("partial")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center group",
                      paymentType === "partial"
                        ? "border-info bg-info/5 shadow-[0_0_20px_hsl(var(--info)/0.1)]"
                        : "border-border hover:border-info/40 hover:bg-info/5"
                    )}
                  >
                    {paymentType === "partial" && (
                      <div className="absolute -top-2 -right-2 p-1 rounded-full bg-info">
                        <CheckCircle2 className="w-3.5 h-3.5 text-info-foreground" />
                      </div>
                    )}
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      paymentType === "partial" ? "bg-info/10" : "bg-secondary"
                    )}>
                      <CreditCard className={cn(
                        "w-6 h-6",
                        paymentType === "partial" ? "text-info" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-semibold",
                        paymentType === "partial" && "text-info"
                      )}>
                        Abono Parcial
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monto personalizado
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount input for partial */}
              {paymentType === "partial" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <Label htmlFor="payment-amount">Monto del abono</Label>
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
                      className="pl-9 text-xl font-bold h-14"
                      autoFocus
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Restante después: <span className="font-semibold text-foreground">{formatCurrency(remaining - (parseFloat(amount) || 0))}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha del cobro</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(paymentDate, "PPP", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => date && setPaymentDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="payment-note" className="text-sm">Nota (opcional)</Label>
                <Textarea
                  id="payment-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Transferencia bancaria, Pago en efectivo..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </>
          ) : (
            /* Confirmation step */
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Banknote className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Confirmar Cobro</h3>
                <p className="text-sm text-muted-foreground">Revisa los detalles antes de confirmar</p>
              </div>

              <div className="rounded-xl bg-secondary/50 border border-border/50 divide-y divide-border/50">
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground">Proyecto</span>
                  <span className="font-medium text-sm">{project.name}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <span className="font-medium text-sm">{paymentType === "full" ? "Pago Completo" : "Abono Parcial"}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground">Monto a cobrar</span>
                  <span className="font-bold text-lg text-success">{formatCurrency(paymentAmount)}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <span className="font-medium text-sm">{format(paymentDate, "PPP", { locale: es })}</span>
                </div>
                {note && (
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-muted-foreground">Nota</span>
                    <span className="text-sm">{note}</span>
                  </div>
                )}
              </div>

              {/* After-payment preview */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Después del cobro</p>
                <Progress value={newProgressPercent} className="h-2.5" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-success font-medium">{formatCurrency(previousPayments + paymentAmount)} cobrado</span>
                  {paymentAmount < remaining && (
                    <span className="text-warning font-medium">{formatCurrency(remaining - paymentAmount)} pendiente</span>
                  )}
                  {paymentAmount >= remaining && (
                    <span className="text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Cobro completo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (step === "confirm") {
                  setStep("select");
                } else {
                  onOpenChange(false);
                }
              }}
            >
              {step === "confirm" ? "Volver" : "Cancelar"}
            </Button>
            {step === "select" ? (
              <Button
                className="flex-1 gap-2"
                onClick={() => setStep("confirm")}
                disabled={!canProceed}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="flex-1 gap-2 bg-success hover:bg-success/90 text-success-foreground"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmar Cobro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
