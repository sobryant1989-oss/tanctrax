-- Convert existing major project checklist items to JSONB so checked dates can be stored.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'major_projects'
      AND column_name = 'checklist_items'
      AND udt_name = 'jsonb'
  ) THEN
    ALTER TABLE major_projects
    ALTER COLUMN checklist_items TYPE jsonb USING checklist_items::jsonb;
  END IF;
END;
$$;
