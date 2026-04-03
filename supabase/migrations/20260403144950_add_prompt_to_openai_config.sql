ALTER TABLE public.openai_config
ADD COLUMN title TEXT DEFAULT 'Leitor de Vagas (IA)',
ADD COLUMN prompt TEXT DEFAULT 'Extraia as informações desta imagem de anúncio de vaga de emprego e retorne um objeto JSON com as seguintes chaves: "titulo" (Título da Vaga) e "descricao" (Descrição da Vaga contendo responsabilidades, requisitos, etc.). Em caso de indisponibilidade não preencha.';
