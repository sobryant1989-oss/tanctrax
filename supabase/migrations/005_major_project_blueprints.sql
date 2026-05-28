ALTER TABLE major_projects
ADD COLUMN IF NOT EXISTS blueprint_attachments JSONB DEFAULT '[]'::jsonb;
