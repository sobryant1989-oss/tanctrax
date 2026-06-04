export interface Profile {

  id: string;

  email: string;

  full_name: string;

  role: string;

  created_at: string;

}

export interface Vendor {

  id: string;

  name: string;

  email: string;

  phone: string;

  created_at: string;

}

export interface WorkOrder {

  id: string;

  work_order_number: string;

  building: string;

  building_abbr?: string;

  engineer_name?: string;

  engineer_email?: string;

  pcr_so_number?: string;

  scope_of_work?: string;

  location: string;

  description: string;

  vendor_id: string;

  vendor_email: string;

  priority: 'Low' | 'Medium' | 'High' | 'Urgent';

  status: 'New' | 'Sent' | 'Acknowledged' | 'In Progress' | 'Waiting Parts' | 'Completed' | 'Closed' | 'VOID';

  estimated_cost: number;

  actual_cost: number;

  created_at: string;

  completed_at: string | null;

  created_by: string;

}

export interface EmailLog {

  id: string;

  work_order_id: string;

  recipient: string;

  subject: string;

  sent_at: string;

}

export interface StatusHistory {

  id: string;

  work_order_id: string;

  status: string;

  changed_at: string;

  changed_by: string;

}

export interface Attachment {

  id: string;

  work_order_id: string;

  file_name: string;

  file_url: string;

  uploaded_at: string;

}

export type WorkOrderFormData = Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'completed_at' | 'created_by'>;

export type MajorProjectPhase = 'Planning' | 'SD' | 'DD' | 'CD' | 'Bid' | 'Construction';

export interface MajorProjectChecklistItem {

  id: string;

  checked_at?: string | null;

}

export interface MajorProjectCustomChecklistDef {
  id: string;
  label: string;
  progress: number;
}

export type MajorProjectChecklistItemValue = string | MajorProjectChecklistItem;

export interface MajorProject {

  id: string;

  title: string;

  pcr_so_number?: string | null;

  phase: MajorProjectPhase;

  description: string | null;

  updates?: string | null;

  progress: number;

  attachments?: MajorProjectAttachment[];

  blueprint_attachments?: MajorProjectAttachment[];

  checklist_items?: MajorProjectChecklistItemValue[];
  custom_checklist_defs?: MajorProjectCustomChecklistDef[];

  assigned_engineer_name?: string | null;

  assigned_engineer_email?: string | null;

  created_at: string;

  updated_at: string;

}

export interface MajorProjectAttachment {

  id: string;

  name: string;

  type: string;

  data_url: string;

  uploaded_at: string;

}
