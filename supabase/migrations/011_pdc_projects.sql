CREATE TABLE IF NOT EXISTS pdc_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_name TEXT NOT NULL,
  normalized_project_name TEXT UNIQUE NOT NULL,
  phase TEXT,
  most_recent_note TEXT,
  project_manager TEXT,
  last_imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE pdc_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view PDC projects"
  ON pdc_projects FOR SELECT
  USING (true);

CREATE POLICY "Anyone can import PDC projects"
  ON pdc_projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update PDC projects"
  ON pdc_projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete PDC projects"
  ON pdc_projects FOR DELETE
  USING (true);
