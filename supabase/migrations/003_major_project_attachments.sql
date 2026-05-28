ALTER TABLE major_projects
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
