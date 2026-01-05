import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "high" | "medium" | "low";
  category: string | null;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "completed";
  priority?: "high" | "medium" | "low";
  category?: string;
  assigned_to?: string;
  due_date?: string;
}

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<Todo[]> => {
      const { data, error } = await supabase
        .from("todos")
        .select(`
          *,
          assignee:profiles!todos_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
  });
};

export const useMyTodos = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-todos", user?.id],
    queryFn: async (): Promise<Todo[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("todos")
        .select(`
          *,
          assignee:profiles!todos_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const { data, error } = await supabase
        .from("todos")
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["my-todos"] });
      toast.success("Tarea creada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear la tarea: " + error.message);
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["my-todos"] });
      toast.success("Tarea actualizada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar la tarea: " + error.message);
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["my-todos"] });
      toast.success("Tarea eliminada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar la tarea: " + error.message);
    },
  });
};
