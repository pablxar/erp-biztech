
-- Goals table
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  due_date date,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can manage goals" ON public.goals
  FOR ALL TO authenticated
  USING (is_team_member(auth.uid()))
  WITH CHECK (is_team_member(auth.uid()));

-- Ideas table
CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  status text NOT NULL DEFAULT 'nueva',
  votes integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can manage ideas" ON public.ideas
  FOR ALL TO authenticated
  USING (is_team_member(auth.uid()))
  WITH CHECK (is_team_member(auth.uid()));
