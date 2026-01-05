-- Create todos table for internal team tasks (not project-specific)
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view todos"
ON public.todos
FOR SELECT
USING (is_team_member(auth.uid()));

CREATE POLICY "Team members can insert todos"
ON public.todos
FOR INSERT
WITH CHECK (is_team_member(auth.uid()));

CREATE POLICY "Team members can update todos"
ON public.todos
FOR UPDATE
USING (is_team_member(auth.uid()));

CREATE POLICY "Team members can delete todos"
ON public.todos
FOR DELETE
USING (is_team_member(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();