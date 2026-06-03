-- Add jsonb column to store client-defined custom checklist definitions per major project
ALTER TABLE major_projects
ADD COLUMN IF NOT EXISTS custom_checklist_defs jsonb DEFAULT '[]'::jsonb;

-- Backfill existing rows with empty array if null
UPDATE major_projects SET custom_checklist_defs = '[]'::jsonb WHERE custom_checklist_defs IS NULL;
