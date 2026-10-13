export interface WardUnit {
  id?: number | string;
  unit_number: string | number;
  unitNumber?: string | number;
  unit_name?: string;
  unitName?: string;
  name?: string;
  representative_name?: string;
  representativeName?: string;
  representative_phone?: string;
  representativePhone?: string;
}

export interface Ward {
  id: number;
  ward_name: string;
  wardName?: string;
  ward_number?: number;
  wardNumber?: number;
  ward_prefix?: string;
  total_units?: number;
  representative_name?: string;
  representativeName?: string;
  contact_phone?: string;
  contactPhone?: string;
  units?: WardUnit[];
  created_at?: string | Date;
}
