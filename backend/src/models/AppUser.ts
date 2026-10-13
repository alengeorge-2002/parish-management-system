export interface AppUser {
  id: number;
  member_id: number;
  access_key: string;
  role: string;
  created_at?: string | Date;
}
