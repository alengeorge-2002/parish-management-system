export interface MassSchedule {
  id: number;
  day_type: string;
  time_slot: string;
  description_en?: string;
  description_ml?: string;
  created_at?: string | Date;
}
