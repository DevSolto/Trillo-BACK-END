-- Supabase RLS policies for v1
-- Assumes columns:
--   public.user(id uuid, email varchar, role enum('admin','editor'))
--   public.task(creatorId uuid, ...)
--   public.task_team_users(task_id uuid, user_id uuid)
-- If your FK columns differ (e.g., creator_id), adjust the column names below.

-- Enable RLS on all relevant tables
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_team_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association ENABLE ROW LEVEL SECURITY;

-- USER policies -------------------------------------------------------------
DROP POLICY IF EXISTS user_select_self ON public."user";
DROP POLICY IF EXISTS user_insert_self ON public."user";
DROP POLICY IF EXISTS user_update_self ON public."user";

CREATE POLICY user_select_self
  ON public."user"
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY user_insert_self
  ON public."user"
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY user_update_self
  ON public."user"
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- TASK policies -------------------------------------------------------------
DROP POLICY IF EXISTS task_select_creator_or_team ON public.task;
DROP POLICY IF EXISTS task_insert_creator ON public.task;
DROP POLICY IF EXISTS task_update_creator ON public.task;
DROP POLICY IF EXISTS task_delete_creator ON public.task;

CREATE POLICY task_select_creator_or_team
  ON public.task
  FOR SELECT TO authenticated
  USING (
    ("creatorId" = auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.task_team_users ttu
      WHERE ttu.task_id = id AND ttu.user_id = auth.uid()
    )
  );

CREATE POLICY task_insert_creator
  ON public.task
  FOR INSERT TO authenticated
  WITH CHECK ("creatorId" = auth.uid());

CREATE POLICY task_update_creator
  ON public.task
  FOR UPDATE TO authenticated
  USING ("creatorId" = auth.uid())
  WITH CHECK ("creatorId" = auth.uid());

CREATE POLICY task_delete_creator
  ON public.task
  FOR DELETE TO authenticated
  USING ("creatorId" = auth.uid());

-- TASK_TEAM_USERS (join table) policies ------------------------------------
DROP POLICY IF EXISTS team_select_self_or_creator ON public.task_team_users;
DROP POLICY IF EXISTS team_insert_self_or_creator ON public.task_team_users;
DROP POLICY IF EXISTS team_delete_self_or_creator ON public.task_team_users;

CREATE POLICY team_select_self_or_creator
  ON public.task_team_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.task t WHERE t.id = task_id AND t."creatorId" = auth.uid()
    )
  );

CREATE POLICY team_insert_self_or_creator
  ON public.task_team_users
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.task t WHERE t.id = task_id AND t."creatorId" = auth.uid()
    )
  );

CREATE POLICY team_delete_self_or_creator
  ON public.task_team_users
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.task t WHERE t.id = task_id AND t."creatorId" = auth.uid()
    )
  );

-- ASSOCIATION policies ------------------------------------------------------
-- Read: any authenticated user can read associations
DROP POLICY IF EXISTS association_read_auth ON public.association;
CREATE POLICY association_read_auth
  ON public.association
  FOR SELECT TO authenticated
  USING (true);

-- Write: only admins (role stored in public.user) can write
DROP POLICY IF EXISTS association_write_admin ON public.association;
CREATE POLICY association_write_admin
  ON public.association
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Notes:
-- - If your environment writes via a service role (bypass RLS), you can
--   still keep these policies for PostgREST exposure safety.
-- - Adjust quoted identifiers if your columns are snake_case.

