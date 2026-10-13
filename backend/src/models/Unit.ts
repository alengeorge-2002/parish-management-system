export interface Unit {
  id: number;
  unit_number: string | number;
  unit_name?: string;
  representative_name?: string;
  representative_phone?: string;
  ward_id: number;
  created_at?: string | Date;
}
