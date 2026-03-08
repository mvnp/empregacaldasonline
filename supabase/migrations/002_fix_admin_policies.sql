-- =============================================
-- Remover policy recursiva e adicionar policies admin
-- =============================================

-- Remover policy recursiva (causa problemas com subquery na mesma tabela)
DROP POLICY IF EXISTS "admin_select_all" ON public.users;

-- Admin policies usando security_invoker = false (bypass RLS via service_role)
-- NOTA: Todas as queries admin usam createAdminClient() que bypassa RLS.
-- Estas policies são apenas para consistência, caso futuro código use anon key.

-- Admin pode ver todos os usuários
CREATE POLICY "admin_select_all"
    ON public.users FOR SELECT
    USING (
        (SELECT tipo FROM public.users WHERE auth_id = auth.uid()) = 'admin'
    );

-- Admin pode atualizar todos os usuários
CREATE POLICY "admin_update_all"
    ON public.users FOR UPDATE
    USING (
        (SELECT tipo FROM public.users WHERE auth_id = auth.uid()) = 'admin'
    );

-- Admin pode excluir usuários
CREATE POLICY "admin_delete_all"
    ON public.users FOR DELETE
    USING (
        (SELECT tipo FROM public.users WHERE auth_id = auth.uid()) = 'admin'
    );
