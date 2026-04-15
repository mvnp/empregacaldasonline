-- Add slug column to vagas
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing vagas with a slug based on title
UPDATE vagas SET slug = lower(regexp_replace(titulo, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
