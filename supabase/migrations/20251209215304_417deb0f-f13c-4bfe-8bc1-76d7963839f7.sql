-- Create a junction table for task assignments (many-to-many)
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members can view task assignments"
ON public.task_assignments
FOR SELECT
USING (is_team_member(auth.uid()));

CREATE POLICY "Team members can insert task assignments"
ON public.task_assignments
FOR INSERT
WITH CHECK (is_team_member(auth.uid()));

CREATE POLICY "Team members can delete task assignments"
ON public.task_assignments
FOR DELETE
USING (is_team_member(auth.uid()));