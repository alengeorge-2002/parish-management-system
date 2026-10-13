export interface WardRepDetails {
  repName: string;
  repPhone: string;
}

const DIRECTORY_WARD_REPRESENTATIVES: Record<string, WardRepDetails> = {
  "1": { repName: "Varghese Mathew", repPhone: "+91 94471 00001" },
  "2": { repName: "Joseph Kuriakose", repPhone: "+91 94471 00002" },
  "3": { repName: "Antony Chacko", repPhone: "+91 94471 00003" },
  "4": { repName: "Thomas George", repPhone: "+91 94471 00004" },
  "5": { repName: "Paulson Devassy", repPhone: "+91 94471 00005" },
  "6": { repName: "Francis Xavier", repPhone: "+91 94471 00006" },
  "7": { repName: "Sebastian Joseph", repPhone: "+91 94471 00007" },
  "8": { repName: "Mathew Philip", repPhone: "+91 94471 00008" },
  "9": { repName: "Joychan Kavalam", repPhone: "+91 94470 11201" },
  "10": { repName: "Antony Puthur", repPhone: "+91 94470 11202" },
  "11": { repName: "Varghese Ambatt", repPhone: "+91 94470 11211" },
  "12": { repName: "Elias Thundiyil", repPhone: "+91 94470 11212" },

  // Keyword lookup mapping
  "alphonsa": { repName: "Varghese Mathew", repPhone: "+91 94471 00001" },
  "chavara": { repName: "Joseph Kuriakose", repPhone: "+91 94471 00002" },
  "christ": { repName: "Antony Chacko", repPhone: "+91 94471 00003" },
  "joseph": { repName: "Thomas George", repPhone: "+91 94471 00004" },
  "little flower": { repName: "Paulson Devassy", repPhone: "+91 94471 00005" },
  "maryland": { repName: "Francis Xavier", repPhone: "+91 94471 00006" },
  "mother theresa": { repName: "Sebastian Joseph", repPhone: "+91 94471 00007" },
  "theresa": { repName: "Sebastian Joseph", repPhone: "+91 94471 00007" },
  "thomas": { repName: "Mathew Philip", repPhone: "+91 94471 00008" },
};

export function getWardRepresentative(ward: any): WardRepDetails {
  if (!ward) return { repName: "Ward Representative", repPhone: "+91 98765 43210" };

  const rawRep = ward.representative_name || ward.representativeName || ward.president || ward.rep;
  const rawPhone = ward.contact_phone || ward.contactPhone || ward.phone;

  const isValidRep = Boolean(
    rawRep && typeof rawRep === "string" && rawRep.trim() !== "" && rawRep.trim() !== "Ward Representative"
  );
  const isValidPhone = Boolean(
    rawPhone && typeof rawPhone === "string" && rawPhone.trim() !== "" && rawPhone.trim() !== "+91 98765 43210"
  );

  if (isValidRep && isValidPhone) {
    return { repName: rawRep.trim(), repPhone: rawPhone.trim() };
  }

  const wardNum = String(ward.ward_number || ward.wardNumber || ward.number || "").trim();
  const wardName = String(ward.ward_name || ward.wardName || ward.patron || "").toLowerCase();

  // Try by ward number
  if (wardNum && DIRECTORY_WARD_REPRESENTATIVES[wardNum]) {
    const matched = DIRECTORY_WARD_REPRESENTATIVES[wardNum];
    return {
      repName: isValidRep ? rawRep.trim() : matched.repName,
      repPhone: isValidPhone ? rawPhone.trim() : matched.repPhone,
    };
  }

  // Try by keyword in ward name
  for (const [key, val] of Object.entries(DIRECTORY_WARD_REPRESENTATIVES)) {
    if (isNaN(Number(key)) && wardName.includes(key)) {
      return {
        repName: isValidRep ? rawRep.trim() : val.repName,
        repPhone: isValidPhone ? rawPhone.trim() : val.repPhone,
      };
    }
  }

  return {
    repName: isValidRep ? rawRep.trim() : "Ward Representative",
    repPhone: isValidPhone ? rawPhone.trim() : "+91 98765 43210",
  };
}
