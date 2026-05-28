ALTER TABLE major_projects
ADD COLUMN IF NOT EXISTS checklist_items JSONB DEFAULT '[]'::jsonb;
