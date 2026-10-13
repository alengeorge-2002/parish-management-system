export interface Event {
  id: number;
  title: string;
  title_en?: string;
  title_ml?: string;
  event_date?: string | Date | null;
  target_date?: string | Date | null;
  mass_time?: string;
  type_badge?: string;
  location?: string;
  description?: string;
  description_en?: string;
  description_ml?: string;
  created_at?: string | Date;
}
