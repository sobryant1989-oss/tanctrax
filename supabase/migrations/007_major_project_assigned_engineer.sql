ALTER TABLE major_projects
ADD COLUMN IF NOT EXISTS assigned_engineer_name TEXT,
ADD COLUMN IF NOT EXISTS assigned_engineer_email TEXT;
