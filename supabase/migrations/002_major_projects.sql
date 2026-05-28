CREATE TABLE IF NOT EXISTS major_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('Planning', 'SD', 'DD', 'CD', 'Bid', 'Construction')),
  description TEXT,
  progress INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE major_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view major projects"
  ON major_projects FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create major projects"
  ON major_projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update major projects"
  ON major_projects FOR UPDATE
  USING (true)
  WITH CHECK (true);
