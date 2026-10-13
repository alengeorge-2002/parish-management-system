export interface ParishCouncil {
  id: number;
  member_id?: number | null;
  role_title: string;
  committee_type: string;
  ward_id?: number | null;
  display_order?: number;
  term?: string;
  occupant_name?: string | null;
  phone?: string | null;
  status?: string;
  created_at?: string | Date;
}
