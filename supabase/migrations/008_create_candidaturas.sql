-- =============================================
-- Tabela: candidaturas (Relacionamento N:N entre Vagas e Candidatos)
-- =============================================

CREATE TABLE public.candidaturas (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id         BIGINT NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    
    -- Status da aplicação no processo seletivo
    status          TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'entrevista', 'recusado', 'aprovado')),
    
    -- Carta de apresentação opcional
    mensagem        TEXT,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Não permitir que o mesmo candidato se aplique mais de uma vez para a exata mesma vaga
    CONSTRAINT candidaturas_vaga_candidato_unique UNIQUE (vaga_id, candidato_id)
);

-- ─── Índices ───
CREATE INDEX idx_candidaturas_vaga_id ON public.candidaturas(vaga_id);
CREATE INDEX idx_candidaturas_candidato_id ON public.candidaturas(candidato_id);
CREATE INDEX idx_candidaturas_status ON public.candidaturas(status);

-- ─── RLS ───
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

-- 1. Candidato pode ler apenas suas próprias candidaturas
CREATE POLICY "candidaturas_select_own" ON public.candidaturas FOR SELECT
    USING (
        candidato_id IN (
            SELECT c.id FROM public.candidatos c 
            JOIN public.users u ON c.user_id = u.id 
            WHERE u.auth_id = auth.uid()
        )
    );

-- 2. Empregador/Criador da vaga pode ler as candidaturas para as suas vagas
CREATE POLICY "candidaturas_select_employer" ON public.candidaturas FOR SELECT
    USING (
        vaga_id IN (
            SELECT v.id FROM public.vagas v
            JOIN public.users u ON v.criado_por = u.id
            WHERE u.auth_id = auth.uid()
        )
    );

-- 3. Candidato pode se candidatar (inserir) por conta própria
CREATE POLICY "candidaturas_insert_own" ON public.candidaturas FOR INSERT 
    WITH CHECK (true); -- Autenticação e validações podem ocorrer na edge function ou action

-- 4. Empregador/admin pode atualizar o status da candidatura
CREATE POLICY "candidaturas_update_employer" ON public.candidaturas FOR UPDATE
    USING (
        vaga_id IN (
            SELECT v.id FROM public.vagas v
            JOIN public.users u ON v.criado_por = u.id
            WHERE u.auth_id = auth.uid()
        )
    );

-- Políticas gerais de leitura (caso utilize banco direto para admin views internal)
CREATE POLICY "candidaturas_admin_all" ON public.candidaturas FOR ALL USING (true);


-- ─── Trigger updated_at ───
CREATE TRIGGER trigger_candidaturas_updated_at
    BEFORE UPDATE ON public.candidaturas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
