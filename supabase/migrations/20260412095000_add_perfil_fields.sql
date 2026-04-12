-- Adiciona apenas CPF, celular e data_nascimento na tabela users (dados pessoais)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS cpf             text,
    ADD COLUMN IF NOT EXISTS celular         text,
    ADD COLUMN IF NOT EXISTS data_nascimento text;

-- Cria tabela dedicada de endereços vinculada ao user_id
CREATE TABLE IF NOT EXISTS user_enderecos (
    user_id     bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    cep         text,
    logradouro  text,
    numero      text,
    complemento text,
    bairro      text,
    cidade      text,
    estado      text,
    updated_at  timestamptz DEFAULT now()
);
