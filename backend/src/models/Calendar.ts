export interface Calendar {
  id: number;
  date_string: string;
  day_data: Record<string, any>;
  created_at?: string | Date;
}
