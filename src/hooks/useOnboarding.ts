import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OnboardingRecord {
  id: string;
  client_id: string;
  status: string;
  company_description: string | null;
  business_goals: string | null;
  target_audience: string | null;
  current_challenges: string | null;
  requested_services: any[] | null;
  timeline: string | null;
  budget_range: string | null;
  competitors: string | null;
  brand_guidelines: string | null;
  additional_notes: string | null;
  ai_proposal: string | null;
  ai_summary: string | null;
  source_file_url: string | null;
  source_file_type: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useClientOnboardings(clientId: string | undefined) {
  return useQuery({
    queryKey: ["onboardings", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("client_onboarding")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OnboardingRecord[];
    },
    enabled: !!clientId,
  });
}

export function useOnboarding(onboardingId: string | undefined) {
  return useQuery({
    queryKey: ["onboarding", onboardingId],
    queryFn: async () => {
      if (!onboardingId) return null;
      const { data, error } = await supabase
        .from("client_onboarding")
        .select("*")
        .eq("id", onboardingId)
        .single();
      if (error) throw error;
      return data as OnboardingRecord;
    },
    enabled: !!onboardingId,
    refetchInterval: (query) => {
      const data = query.state.data as OnboardingRecord | null | undefined;
      if (data?.status === "processing") return 3000;
      return false;
    },
  });
}

export function useCreateOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("client_onboarding")
        .insert({ client_id: clientId, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as OnboardingRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["onboardings", data.client_id] });
    },
    onError: () => toast.error("Error al crear el onboarding"),
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnboardingRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("client_onboarding")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as OnboardingRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", data.id] });
      queryClient.invalidateQueries({ queryKey: ["onboardings", data.client_id] });
      toast.success("Onboarding actualizado");
    },
    onError: () => toast.error("Error al actualizar"),
  });
}

export function useProcessOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      onboardingId,
      clientId,
      file,
    }: {
      onboardingId: string;
      clientId: string;
      file: File;
    }) => {
      // Upload file to storage
      const timestamp = Date.now();
      const filePath = `${clientId}/${timestamp}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("onboarding-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Update file URL in record
      const { data: { publicUrl } } = supabase.storage
        .from("onboarding-files")
        .getPublicUrl(filePath);

      const fileType = file.type.includes("pdf") ? "pdf" : "audio";

      await supabase
        .from("client_onboarding")
        .update({
          source_file_url: filePath,
          source_file_type: fileType,
        })
        .eq("id", onboardingId);

      // Extract text from PDF (read as text for now)
      let fileContent = "";
      if (fileType === "pdf") {
        // Read file as text - for PDFs we send the raw content
        // The AI model can handle extracting text from the content
        const text = await file.text();
        fileContent = text.length > 100 
          ? text 
          : `[Archivo PDF subido: ${file.name}. El contenido no pudo extraerse como texto plano. Por favor, proporciona una transcripción o resumen de la reunión.]`;
      } else {
        fileContent = `[Archivo de audio subido: ${file.name}. Transcripción pendiente. Por favor, proporciona la transcripción de la reunión.]`;
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke("process-onboarding", {
        body: { onboardingId, clientId, fileContent },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", variables.onboardingId] });
      queryClient.invalidateQueries({ queryKey: ["onboardings", variables.clientId] });
      toast.success("¡Onboarding procesado con IA exitosamente!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al procesar el archivo");
    },
  });
}
