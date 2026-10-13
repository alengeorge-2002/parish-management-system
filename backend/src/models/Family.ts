export interface Family {
  id: number;
  family_name: string;
  head_of_family?: string | null;
  ward_id?: number | null;
  unit_number: string;
  house_name: string;
  home_address?: string;
  family_photo_url?: string | null;
  contact_number?: string | null;
  unit_id?: number | null;
  reg_no?: string | null;
  email?: string | null;
  family_code?: string | null;
  created_at?: string | Date;
}
