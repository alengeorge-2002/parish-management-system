export interface WardRepDetails {
  repName: string;
  repPhone: string;
}

export function getWardRepresentative(ward: any): WardRepDetails {
  if (!ward) return { repName: "Unassigned", repPhone: "—" };

  const rawRep = ward.representative_name || ward.representativeName || ward.president || ward.rep;
  const rawPhone = ward.contact_phone || ward.contactPhone || ward.phone;

  return {
    repName: rawRep && typeof rawRep === "string" && rawRep.trim() ? rawRep.trim() : "Unassigned",
    repPhone: rawPhone && typeof rawPhone === "string" && rawPhone.trim() ? rawPhone.trim() : "—",
  };
}
