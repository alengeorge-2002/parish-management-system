export interface ReligiousHouseResident {
  id?: number | string;
  name: string;
  designation?: string;
  phone?: string;
  email?: string;
  photo?: string;
}

export interface ReligiousHouse {
  id: number;
  name: string;
  category_type?: string;
  category?: string;
  superior_in_charge?: string;
  resident_count?: number;
  contact_number?: string;
  email?: string;
  address?: string;
  photo_url?: string;
  residents?: ReligiousHouseResident[];
  created_at?: string | Date;
}
