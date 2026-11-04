export type Sacrament = "baptism" | "communion" | "confirmation" | "marriage";
export type MemberStatus = "active" | "deceased" | "relocated";

export interface Member {
  id: string;
  name: string;
  nameMl: string;
  baptismName: string;
  avatar: string;
  familyHouse: string;
  familyId: string;
  ward: number;
  wardPatron: string;
  phone: string;
  blood: string;
  sacraments: Sacrament[];
  status: MemberStatus;
  gender: "M" | "F";
}

export interface Family {
  id: string;
  name: string;
  house: string;
  head: string;
  phone: string;
  ward: number;
  wardPatron: string;
  banner: string;
  memberCount: number;
  avatars: string[];
}

export interface Ward {
  number: number;
  patron: string;
  patronMl: string;
  rep: string;
  phone: string;
  families: number;
}

export interface Clergy {
  id: string;
  name: string;
  title: string;
  role: string;
  phone: string;
  portrait: string;
  tenure: string;
  primary?: boolean;
}

export interface MassTiming {
  time: string;
  language: "Malayalam" | "English";
  priest: string;
}

export interface Bulletin {
  id: string;
  title: string;
  date: string;
  status: "active" | "draft";
  excerpt: string;
}

const AV = (id: string, w = 96) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${w}&fit=crop&auto=format&crop=faces`;

export const WARDS: Ward[] = [];

const allSac: Sacrament[] = ["baptism", "communion", "confirmation", "marriage"];

export const MEMBERS: Member[] = [];

const BANNER = (id: string) =>
  `https://images.unsplash.com/${id}?w=640&h=360&fit=crop&auto=format`;

export const FAMILIES: Family[] = [];

export const CLERGY: Clergy[] = [];

export const MASS_TIMINGS: MassTiming[] = [
  { time: "05:45 AM", language: "Malayalam", priest: "Fr. Jomon Palakkappilly" },
  { time: "07:00 AM", language: "Malayalam", priest: "Fr. Sebastian Vadakkumchery" },
  { time: "09:30 AM", language: "English", priest: "Fr. Sebastian Vadakkumchery" },
  { time: "06:00 PM", language: "Malayalam", priest: "Fr. Jomon Palakkappilly" },
];

export const BULLETINS: Bulletin[] = [];

export const RECENT_REGISTRATIONS: any[] = [];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export interface FeastDay {
  date: number;
  month: number; // 0-indexed
  saintEn: string;
  saintMl: string;
  season: "advent" | "christmas" | "lent" | "easter" | "ordinary";
}

export interface ReligiousHouse {
  id: string;
  name: string;
  nameMl: string;
  congregation: string;
  type: "Convent" | "Monastery" | "Formation House";
  superior: string;
  phone: string;
  members: number;
  established: string;
  image: string;
}

export const RELIGIOUS_HOUSES: ReligiousHouse[] = [
  { id: "RH-1", name: "Carmel Convent", nameMl: "കർമ്മൽ കോൺവെന്റ്", congregation: "CMC Sisters", type: "Convent", superior: "Sr. Little Rose CMC", phone: "+91 94470 71001", members: 14, established: "1962", image: "https://images.unsplash.com/photo-1543965170-4c01a586684e?w=640&h=360&fit=crop&auto=format" },
  { id: "RH-2", name: "St. Joseph Friary", nameMl: "സെന്റ് ജോസഫ് ഫ്രയറി", congregation: "OFM Cap.", type: "Monastery", superior: "Fr. Bonaventure OFM", phone: "+91 94470 71002", members: 9, established: "1978", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=640&h=360&fit=crop&auto=format" },
  { id: "RH-3", name: "Nirmala Formation House", nameMl: "നിർമ്മല ഭവനം", congregation: "SABS Sisters", type: "Formation House", superior: "Sr. Christy SABS", phone: "+91 94470 71003", members: 22, established: "1995", image: "https://images.unsplash.com/photo-1548625149-720134d51a3a?w=640&h=360&fit=crop&auto=format" },
  { id: "RH-4", name: "Little Flower Convent", nameMl: "ചെറുപുഷ്പ കോൺവെന്റ്", congregation: "FCC Sisters", type: "Convent", superior: "Sr. Ancilla FCC", phone: "+91 94470 71004", members: 11, established: "1984", image: "https://images.unsplash.com/photo-1520637836862-4d197d17c38a?w=640&h=360&fit=crop&auto=format" },
];

export interface Ministry {
  id: string;
  name: string;
  nameMl: string;
  coordinator: string;
  phone: string;
  members: number;
  category: "Liturgical" | "Youth" | "Charity" | "Catechetical" | "Devotional";
  meets: string;
}

export const MINISTRIES: Ministry[] = [
  { id: "MN-1", name: "Altar Servers Guild", nameMl: "അൾത്താര ബാലന്മാർ", coordinator: "Dn. Alex Karimban", phone: "+91 94470 72001", members: 38, category: "Liturgical", meets: "Sat 4:00 PM" },
  { id: "MN-2", name: "Parish Choir", nameMl: "ഗായകസംഘം", coordinator: "Mr. Jocy Fernandez", phone: "+91 94470 72002", members: 26, category: "Liturgical", meets: "Fri 7:00 PM" },
  { id: "MN-3", name: "Kerala Catholic Youth Movement", nameMl: "കെ.സി.വൈ.എം", coordinator: "Mr. Nithin Joseph", phone: "+91 94470 72003", members: 112, category: "Youth", meets: "Sun 5:00 PM" },
  { id: "MN-4", name: "St. Vincent de Paul Society", nameMl: "വിൻസെന്റ് ഡി പോൾ", coordinator: "Mrs. Gracy Thundiyil", phone: "+91 94470 72004", members: 19, category: "Charity", meets: "1st Sun 3:00 PM" },
  { id: "MN-5", name: "Sunday Catechism", nameMl: "മതബോധന ക്ലാസ്", coordinator: "Sr. Little Rose CMC", phone: "+91 94470 72005", members: 340, category: "Catechetical", meets: "Sun 9:00 AM" },
  { id: "MN-6", name: "Legion of Mary", nameMl: "ലീജിയൻ ഓഫ് മേരി", coordinator: "Mrs. Anna Kizhakkel", phone: "+91 94470 72006", members: 44, category: "Devotional", meets: "Wed 6:30 PM" },
  { id: "MN-7", name: "Charismatic Prayer Group", nameMl: "കരിസ്മാറ്റിക് പ്രാർത്ഥന", coordinator: "Mr. Paulose Karottu", phone: "+91 94470 72007", members: 67, category: "Devotional", meets: "Thu 7:00 PM" },
  { id: "MN-8", name: "Mother's Forum (Matru Vedi)", nameMl: "മാതൃവേദി", coordinator: "Mrs. Rosamma Edathil", phone: "+91 94470 72008", members: 156, category: "Charity", meets: "2nd Sun 3:30 PM" },
];

export interface CouncilSeat {
  id: string;
  seat: string;
  seatMl: string;
  holder: string | null;
  ward: number | null;
  phone: string | null;
  term: string;
  status: "filled" | "vacant";
}

export const COUNCIL_SEATS: CouncilSeat[] = [
  { id: "PC-1", seat: "President (Vicar)", seatMl: "പ്രസിഡന്റ്", holder: "Fr. Sebastian Vadakkumchery", ward: null, phone: "+91 94470 90001", term: "2024 – 2026", status: "filled" },
  { id: "PC-2", seat: "Vice President", seatMl: "വൈസ് പ്രസിഡന്റ്", holder: "Mr. Varghese Ambatt", ward: 1, phone: "+91 94470 90005", term: "2024 – 2026", status: "filled" },
  { id: "PC-3", seat: "Secretary", seatMl: "സെക്രട്ടറി", holder: "Dr. Mathew Kalapurackal", ward: 3, phone: "+91 94470 90003", term: "2024 – 2026", status: "filled" },
  { id: "PC-4", seat: "Treasurer", seatMl: "ട്രഷറർ", holder: "Mrs. Gracy Thundiyil", ward: 7, phone: "+91 94470 90004", term: "2024 – 2026", status: "filled" },
  { id: "PC-5", seat: "Trustee (Kaikkaran) I", seatMl: "കൈക്കാരൻ I", holder: "Mr. Joychan Kavalam", ward: 1, phone: "+91 94470 11201", term: "2024 – 2026", status: "filled" },
  { id: "PC-6", seat: "Trustee (Kaikkaran) II", seatMl: "കൈക്കാരൻ II", holder: null, ward: null, phone: null, term: "2024 – 2026", status: "vacant" },
  { id: "PC-7", seat: "Youth Representative", seatMl: "യുവജന പ്രതിനിധി", holder: "Mr. Nithin Joseph", ward: 7, phone: "+91 94470 72003", term: "2025 – 2026", status: "filled" },
  { id: "PC-8", seat: "Women's Representative", seatMl: "വനിതാ പ്രതിനിധി", holder: "Mrs. Anna Kizhakkel", ward: 4, phone: "+91 94470 88402", term: "2024 – 2026", status: "filled" },
  { id: "PC-9", seat: "Ward #1 Councillor (St. Alphonsa Ward)", seatMl: "വാർഡ് #1 കൗൺസിലർ", holder: "Varghese Mathew", ward: 1, phone: "+91 94471 00001", term: "2024 – 2026", status: "filled" },
  { id: "PC-10", seat: "Ward #2 Councillor (St. Chavara Ward)", seatMl: "വാർഡ് #2 കൗൺസിലർ", holder: "Joseph Kuriakose", ward: 2, phone: "+91 94471 00002", term: "2024 – 2026", status: "filled" },
  { id: "PC-11", seat: "Ward #3 Councillor (Christ The King Ward)", seatMl: "വാർഡ് #3 കൗൺസിലർ", holder: "Antony Chacko", ward: 3, phone: "+91 94471 00003", term: "2024 – 2026", status: "filled" },
  { id: "PC-12", seat: "Ward #4 Councillor (Holy Family Ward)", seatMl: "വാർഡ് #4 കൗൺസിലർ", holder: "Thomas John", ward: 4, phone: "+91 94471 00004", term: "2024 – 2026", status: "filled" },
  { id: "PC-13", seat: "Ward #5 Councillor (Little Flower Ward)", seatMl: "വാർഡ് #5 കൗൺസിലർ", holder: "Mathai Varghese", ward: 5, phone: "+91 94471 00005", term: "2024 – 2026", status: "filled" },
  { id: "PC-14", seat: "Ward #6 Councillor (Sacred Heart Ward)", seatMl: "വാർഡ് #6 കൗൺസിലർ", holder: "George Joseph", ward: 6, phone: "+91 94471 00006", term: "2024 – 2026", status: "filled" },
  { id: "PC-15", seat: "Ward #7 Councillor (St. Sebastian Ward)", seatMl: "വാർഡ് #7 കൗൺസിലർ", holder: "Sebastian Paul", ward: 7, phone: "+91 94471 00007", term: "2024 – 2026", status: "filled" },
  { id: "PC-16", seat: "Ward #8 Councillor (St. Thomas Ward)", seatMl: "വാർഡ് #8 കൗൺസിലർ", holder: "Philip Augustine", ward: 8, phone: "+91 94471 00008", term: "2024 – 2026", status: "filled" },
];

export const FEASTS_MARCH: FeastDay[] = [
  { date: 4, month: 2, saintEn: "St. Casimir", saintMl: "വിശുദ്ധ കാസിമിർ", season: "lent" },
  { date: 7, month: 2, saintEn: "Sts. Perpetua & Felicity", saintMl: "പെർപ്പെത്വ & ഫെലിസിറ്റി", season: "lent" },
  { date: 9, month: 2, saintEn: "St. Frances of Rome", saintMl: "റോമിലെ ഫ്രാൻസിസ്", season: "lent" },
  { date: 19, month: 2, saintEn: "St. Joseph, Spouse of Mary", saintMl: "വിശുദ്ധ യൗസേപ്പിതാവ്", season: "lent" },
  { date: 25, month: 2, saintEn: "The Annunciation", saintMl: "മംഗളവാർത്ത തിരുനാൾ", season: "lent" },
];
