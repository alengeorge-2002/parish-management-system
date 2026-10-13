export interface Announcement {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  poster_url?: string | null;
  priority?: string;
  is_active?: boolean;
  expiry_date?: string | Date | null;
  announcement_date?: string | Date;
  created_at?: string | Date;
}
