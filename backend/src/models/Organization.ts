export interface OrganizationMember {
  id?: number | string;
  member_id?: number | string;
  parishioner?: number | string;
  parishioner_id?: number | string;
  role?: string;
  role_title?: string;
  display_order?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  email?: string | null;
}

export interface Organization {
  id: number;
  title: string;
  name_en?: string;
  name_ml?: string;
  category?: string;
  description?: string | null;
  icon_symbol?: string | null;
  members?: OrganizationMember[];
  created_at?: string | Date;
}
