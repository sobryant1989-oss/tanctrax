ALTER TABLE major_projects
DROP CONSTRAINT IF EXISTS major_projects_phase_check;

ALTER TABLE major_projects
ADD CONSTRAINT major_projects_phase_check
CHECK (phase IN ('Planning', 'SD', 'DD', 'CD', 'Bid', 'Construction', 'Complete'));
