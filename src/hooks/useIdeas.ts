import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  votes: number;
  created_by: string | null;
  created_at: string;
}

export function useIdeas() {
  return useQuery({
    queryKey: ["ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("votes", { ascending: false });
      if (error) throw error;
      return data as Idea[];
    },
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (idea: { title: string; description?: string; category?: string }) => {
      const { data, error } = await supabase
        .from("ideas")
        .insert({ ...idea, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea creada exitosamente");
    },
    onError: () => toast.error("Error al crear la idea"),
  });
}

export function useVoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, votes }: { id: string; votes: number }) => {
      const { error } = await supabase
        .from("ideas")
        .update({ votes: votes + 1 })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideas"] }),
    onError: () => toast.error("Error al votar"),
  });
}

export function useUpdateIdeaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("ideas")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Error al actualizar estado"),
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea eliminada");
    },
    onError: () => toast.error("Error al eliminar la idea"),
  });
}
