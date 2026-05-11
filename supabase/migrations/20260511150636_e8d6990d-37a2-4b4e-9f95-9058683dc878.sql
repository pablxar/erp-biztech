-- Add explicit restrictive policies to deny anonymous access on sensitive tables
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to projects"
ON public.projects
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to subtasks"
ON public.subtasks
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);