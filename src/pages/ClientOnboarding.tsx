import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, Sparkles, FolderPlus, Plus, Trash2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useClientOnboardings, useCreateOnboarding, useOnboarding, useProcessOnboarding } from "@/hooks/useOnboarding";
import { OnboardingUploader } from "@/components/onboarding/OnboardingUploader";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { OnboardingProposal } from "@/components/onboarding/OnboardingProposal";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ClientOnboarding() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { data: clients } = useClients();
  const client = clients?.find(c => c.id === clientId);
  const { data: onboardings, isLoading } = useClientOnboardings(clientId);
  const createOnboarding = useCreateOnboarding();
  const processOnboarding = useProcessOnboarding();

  const [selectedOnboardingId, setSelectedOnboardingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const { data: selectedOnboarding } = useOnboarding(selectedOnboardingId ?? undefined);

  // Auto-select latest onboarding
  useEffect(() => {
    if (onboardings?.length && !selectedOnboardingId) {
      setSelectedOnboardingId(onboardings[0].id);
      if (onboardings[0].status === "completed") {
        setActiveTab("form");
      }
    }
  }, [onboardings, selectedOnboardingId]);

  const handleNewOnboarding = async () => {
    if (!clientId) return;
    const result = await createOnboarding.mutateAsync(clientId);
    setSelectedOnboardingId(result.id);
    setActiveTab("upload");
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedOnboardingId || !clientId) return;
    try {
      await processOnboarding.mutateAsync({
        onboardingId: selectedOnboardingId,
        clientId,
        file,
      });
      setActiveTab("form");
    } catch {
      // Error handled in hook
    }
  };

  const handleCreateProject = () => {
    navigate("/projects", { state: { createProject: true, clientId } });
  };

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="link" onClick={() => navigate("/clients")}>Volver a clientes</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            <p className="text-sm text-muted-foreground">{client.name} {client.company ? `· ${client.company}` : ""}</p>
          </div>
        </div>
        <Button onClick={handleNewOnboarding} disabled={createOnboarding.isPending} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Onboarding
        </Button>
      </div>

      {/* Onboarding List (if multiple) */}
      {onboardings && onboardings.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {onboardings.map(ob => (
            <button
              key={ob.id}
              onClick={() => {
                setSelectedOnboardingId(ob.id);
                setActiveTab(ob.status === "completed" ? "form" : "upload");
              }}
              className={cn(
                "shrink-0 px-4 py-2 rounded-lg text-sm transition-colors",
                selectedOnboardingId === ob.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 hover:bg-secondary"
              )}
            >
              {format(new Date(ob.created_at), "d MMM yyyy", { locale: es })}
              <Badge variant="outline" className="ml-2 text-[10px]">
                {ob.status === "completed" ? "Completado" : ob.status === "processing" ? "Procesando" : "Borrador"}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* No onboarding yet */}
      {!isLoading && (!onboardings || onboardings.length === 0) && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Sin onboardings</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Crea un onboarding para este cliente subiendo una transcripción de reunión
          </p>
          <Button onClick={handleNewOnboarding} className="gap-2">
            <Plus className="w-4 h-4" />
            Crear Onboarding
          </Button>
        </div>
      )}

      {/* Active Onboarding */}
      {selectedOnboarding && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Subir Archivo
            </TabsTrigger>
            <TabsTrigger value="form" className="gap-2" disabled={selectedOnboarding.status === "draft" && !selectedOnboarding.ai_summary}>
              <FileText className="w-4 h-4" />
              Formulario
            </TabsTrigger>
            <TabsTrigger value="proposal" className="gap-2" disabled={!selectedOnboarding.ai_proposal}>
              <Sparkles className="w-4 h-4" />
              Propuesta
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="upload">
              <OnboardingUploader
                onFileSelect={handleFileSelect}
                isProcessing={processOnboarding.isPending || selectedOnboarding.status === "processing"}
              />
            </TabsContent>

            <TabsContent value="form">
              <OnboardingForm onboarding={selectedOnboarding} onSaved={() => toast.success("Datos guardados")} />
            </TabsContent>

            <TabsContent value="proposal">
              <OnboardingProposal onboarding={selectedOnboarding} onCreateProject={handleCreateProject} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
