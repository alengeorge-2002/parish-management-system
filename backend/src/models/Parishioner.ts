export interface Parishioner {
  id: number;
  family_id: number;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  email?: string | null;
  relationship_role: string;
  is_head_of_household: boolean;
  dob?: string | Date | null;
  dom?: string | Date | null;
  occupation?: string | null;
  blood_group?: string | null;
  malayalam_name?: string | null;
  baptism_name?: string | null;
  gender?: string;
  status?: string;
  sacraments?: string[];
  created_at?: string | Date;
}

export type Member = Parishioner;
