export interface Clergy {
  id: number;
  name: string;
  role_type: string;
  role?: string;
  designation?: string | null;
  address?: string | null;
  email?: string | null;
  phone_number?: string | null;
  blood_group?: string | null;
  avatar_url?: string | null;
  display_order?: number;
  is_quick_contact?: boolean;
  house_id?: number | string | null;
  created_at?: string | Date;
}
