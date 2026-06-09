-- db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_number text UNIQUE NOT NULL,
  building text NOT NULL,
  building_abbr text,
  engineer_name text,
  engineer_email text,
  pcr_so_number text,
  scope_of_work text,
  location text NOT NULL,
  description text,
  vendor_id uuid,
  vendor_email text,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'New',
  estimated_cost numeric NOT NULL DEFAULT 0,
  actual_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_by text NOT NULL
);

CREATE TABLE IF NOT EXISTS major_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  pcr_so_number text,
  phase text NOT NULL,
  description text,
  updates text,
  progress integer NOT NULL DEFAULT 0,
  attachments jsonb NOT NULL DEFAULT '[]',
  blueprint_attachments jsonb NOT NULL DEFAULT '[]',
  checklist_items jsonb NOT NULL DEFAULT '[]',
  assigned_engineer_name text,
  assigned_engineer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pdc_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  normalized_project_name text UNIQUE NOT NULL,
  phase text,
  most_recent_note text,
  project_manager text,
  last_imported_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
