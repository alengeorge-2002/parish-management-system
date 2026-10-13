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

export const WARDS: Ward[] = [
  { number: 1, patron: "St. Mary's", patronMl: "വിശുദ്ധ മറിയം", rep: "Joychan Kavalam", phone: "+91 94470 11201", families: 74 },
  { number: 2, patron: "St. Thomas", patronMl: "വിശുദ്ധ തോമസ്", rep: "Antony Puthur", phone: "+91 94470 11202", families: 68 },
  { number: 3, patron: "St. Sebastian", patronMl: "വിശുദ്ധ സെബസ്ത്യാനോസ്", rep: "Baby Kochuppurackal", phone: "+91 94470 11203", families: 81 },
  { number: 4, patron: "St. George", patronMl: "വിശുദ്ധ ഗീവർഗീസ്", rep: "Thomas Chelakkal", phone: "+91 94470 11204", families: 59 },
  { number: 5, patron: "St. Antony", patronMl: "വിശുദ്ധ അന്തോണീസ്", rep: "Jose Mundackal", phone: "+91 94470 11205", families: 72 },
  { number: 6, patron: "Little Flower", patronMl: "ചെറുപുഷ്പം", rep: "Mary Vadakkel", phone: "+91 94470 11206", families: 63 },
  { number: 7, patron: "Sacred Heart", patronMl: "തിരുഹൃദയം", rep: "Kurian Manjaly", phone: "+91 94470 11207", families: 77 },
  { number: 8, patron: "St. Joseph", patronMl: "വിശുദ്ധ യൗസേപ്പ്", rep: "Devassy Palathinkal", phone: "+91 94470 11208", families: 66 },
  { number: 9, patron: "St. Alphonsa", patronMl: "വിശുദ്ധ അൽഫോൻസ", rep: "Rosamma Edathil", phone: "+91 94470 11209", families: 58 },
  { number: 10, patron: "St. Chavara", patronMl: "വിശുദ്ധ ചാവറ", rep: "Paulose Karottu", phone: "+91 94470 11210", families: 70 },
  { number: 11, patron: "St. Jude", patronMl: "വിശുദ്ധ യൂദാ", rep: "Varghese Ambatt", phone: "+91 94470 11211", families: 61 },
  { number: 12, patron: "Holy Family", patronMl: "തിരുക്കുടുംബം", rep: "Elias Thundiyil", phone: "+91 94470 11212", families: 69 },
  { number: 13, patron: "St. Francis", patronMl: "വിശുദ്ധ ഫ്രാൻസിസ്", rep: "Simon Poovathur", phone: "+91 94470 11213", families: 55 },
  { number: 14, patron: "St. Mary Magdalene", patronMl: "മഗ്ദലേന മറിയം", rep: "Anna Kizhakkel", phone: "+91 94470 11214", families: 64 },
  { number: 15, patron: "St. Michael", patronMl: "വിശുദ്ധ മിഖായേൽ", rep: "George Nedumkallel", phone: "+91 94470 11215", families: 60 },
  { number: 16, patron: "Our Lady of Lourdes", patronMl: "ലൂർദ് മാതാവ്", rep: "Tomy Vazhappilly", phone: "+91 94470 11216", families: 51 },
];

const allSac: Sacrament[] = ["baptism", "communion", "confirmation", "marriage"];

export const MEMBERS: Member[] = [
  { id: "PM-1042", name: "Joseph Thekkedathu", nameMl: "ജോസഫ് തെക്കേടത്ത്", baptismName: "Joseph", avatar: AV("photo-1500648767791-00dcc994a43e"), familyHouse: "Thekkedathu", familyId: "F-108", ward: 1, wardPatron: "St. Mary's", phone: "+91 98470 22108", blood: "O+", sacraments: allSac, status: "active", gender: "M" },
  { id: "PM-1043", name: "Mariamma Thekkedathu", nameMl: "മറിയാമ്മ തെക്കേടത്ത്", baptismName: "Mary", avatar: AV("photo-1544005313-94ddf0286df2"), familyHouse: "Thekkedathu", familyId: "F-108", ward: 1, wardPatron: "St. Mary's", phone: "+91 98470 22109", blood: "B+", sacraments: allSac, status: "active", gender: "F" },
  { id: "PM-1044", name: "Antony Kochupurackal", nameMl: "അന്തോണി കൊച്ചുപുരയ്ക്കൽ", baptismName: "Antony", avatar: AV("photo-1507003211169-0a1dd7228f2d"), familyHouse: "Kochupurackal", familyId: "F-233", ward: 3, wardPatron: "St. Sebastian", phone: "+91 98470 33212", blood: "A+", sacraments: ["baptism", "communion", "confirmation"], status: "active", gender: "M" },
  { id: "PM-1045", name: "Sr. Teresa Mundackal", nameMl: "സി. തെരേസ മുണ്ടയ്ക്കൽ", baptismName: "Teresa", avatar: AV("photo-1573496359142-b8d87734a5a2"), familyHouse: "Mundackal", familyId: "F-051", ward: 5, wardPatron: "St. Antony", phone: "+91 98470 44051", blood: "AB+", sacraments: ["baptism", "communion", "confirmation"], status: "active", gender: "F" },
  { id: "PM-1046", name: "Thomas Chelakkal", nameMl: "തോമസ് ചേലക്കൽ", baptismName: "Thomas", avatar: AV("photo-1519085360753-af0119f7cbe7"), familyHouse: "Chelakkal", familyId: "F-419", ward: 4, wardPatron: "St. George", phone: "+91 98470 55419", blood: "O-", sacraments: ["baptism"], status: "relocated", gender: "M" },
  { id: "PM-1047", name: "Rosamma Edathil", nameMl: "റോസമ്മ ഇടത്തിൽ", baptismName: "Rose", avatar: AV("photo-1487412720507-e7ab37603c6f"), familyHouse: "Edathil", familyId: "F-309", ward: 9, wardPatron: "St. Alphonsa", phone: "+91 98470 66309", blood: "A-", sacraments: allSac, status: "active", gender: "F" },
  { id: "PM-1048", name: "Kurian Manjaly", nameMl: "കുര്യൻ മഞ്ഞളി", baptismName: "Cyriac", avatar: AV("photo-1506794778202-cad84cf45f1d"), familyHouse: "Manjaly", familyId: "F-177", ward: 7, wardPatron: "Sacred Heart", phone: "+91 98470 77177", blood: "B-", sacraments: allSac, status: "deceased", gender: "M" },
  { id: "PM-1049", name: "Anna Kizhakkel", nameMl: "അന്ന കിഴക്കേൽ", baptismName: "Anna", avatar: AV("photo-1534528741775-53994a69daeb"), familyHouse: "Kizhakkel", familyId: "F-402", ward: 14, wardPatron: "St. Mary Magdalene", phone: "+91 98470 88402", blood: "O+", sacraments: ["baptism", "communion"], status: "active", gender: "F" },
  { id: "PM-1050", name: "George Nedumkallel", nameMl: "ജോർജ് നെടുംകല്ലേൽ", baptismName: "George", avatar: AV("photo-1508341591423-4347099e1f19"), familyHouse: "Nedumkallel", familyId: "F-515", ward: 15, wardPatron: "St. Michael", phone: "+91 98470 99515", blood: "AB-", sacraments: allSac, status: "active", gender: "M" },
  { id: "PM-1051", name: "Elsy Palathinkal", nameMl: "എൽസി പാലത്തിങ്കൽ", baptismName: "Elizabeth", avatar: AV("photo-1502823403499-6ccfcf4fb453"), familyHouse: "Palathinkal", familyId: "F-088", ward: 8, wardPatron: "St. Joseph", phone: "+91 98470 10088", blood: "A+", sacraments: ["baptism", "communion", "confirmation"], status: "active", gender: "F" },
  { id: "PM-1052", name: "Paulose Karottu", nameMl: "പൗലോസ് കരോട്ട്", baptismName: "Paul", avatar: AV("photo-1472099645785-5658abf4ff4e"), familyHouse: "Karottu", familyId: "F-260", ward: 10, wardPatron: "St. Chavara", phone: "+91 98470 20260", blood: "O+", sacraments: allSac, status: "active", gender: "M" },
  { id: "PM-1053", name: "Lissy Vazhappilly", nameMl: "ലിസി വാഴപ്പിള്ളി", baptismName: "Lucy", avatar: AV("photo-1531123897727-8f129e1688ce"), familyHouse: "Vazhappilly", familyId: "F-491", ward: 16, wardPatron: "Our Lady of Lourdes", phone: "+91 98470 30491", blood: "B+", sacraments: ["baptism", "communion"], status: "active", gender: "F" },
];

const BANNER = (id: string) =>
  `https://images.unsplash.com/${id}?w=640&h=360&fit=crop&auto=format`;

export const FAMILIES: Family[] = [
  { id: "F-108", name: "Thekkedathu", house: "Thekkedathu House", head: "Joseph Thekkedathu", phone: "+91 98470 22108", ward: 1, wardPatron: "St. Mary's", banner: BANNER("photo-1518780664697-55e3ad937233"), memberCount: 6, avatars: [MEMBERS[0].avatar, MEMBERS[1].avatar, MEMBERS[7].avatar, MEMBERS[9].avatar] },
  { id: "F-233", name: "Kochupurackal", house: "Kochupurackal House", head: "Antony Kochupurackal", phone: "+91 98470 33212", ward: 3, wardPatron: "St. Sebastian", banner: BANNER("photo-1449844908441-8829872d2607"), memberCount: 5, avatars: [MEMBERS[2].avatar, MEMBERS[3].avatar, MEMBERS[5].avatar] },
  { id: "F-051", name: "Mundackal", house: "Mundackal House", head: "Jose Mundackal", phone: "+91 98470 44051", ward: 5, wardPatron: "St. Antony", banner: BANNER("photo-1560448204-e02f11c3d0e2"), memberCount: 4, avatars: [MEMBERS[3].avatar, MEMBERS[10].avatar] },
  { id: "F-309", name: "Edathil", house: "Edathil House", head: "Rosamma Edathil", phone: "+91 98470 66309", ward: 9, wardPatron: "St. Alphonsa", banner: BANNER("photo-1570129477492-45c003edd2be"), memberCount: 7, avatars: [MEMBERS[5].avatar, MEMBERS[8].avatar, MEMBERS[11].avatar, MEMBERS[0].avatar] },
  { id: "F-177", name: "Manjaly", house: "Manjaly House", head: "Kurian Manjaly", phone: "+91 98470 77177", ward: 7, wardPatron: "Sacred Heart", banner: BANNER("photo-1512917774080-9991f1c4c750"), memberCount: 5, avatars: [MEMBERS[6].avatar, MEMBERS[1].avatar, MEMBERS[9].avatar] },
  { id: "F-515", name: "Nedumkallel", house: "Nedumkallel House", head: "George Nedumkallel", phone: "+91 98470 99515", ward: 15, wardPatron: "St. Michael", banner: BANNER("photo-1580587771525-78b9dba3b914"), memberCount: 4, avatars: [MEMBERS[8].avatar, MEMBERS[10].avatar] },
];

export const CLERGY: Clergy[] = [
  { id: "C-1", name: "Fr. Sebastian Vadakkumchery", title: "Vicar", role: "Parish Priest & Presbyter", phone: "+91 94470 90001", portrait: AV("photo-1560250097-0b93528c311a", 400), tenure: "2021 – Present", primary: true },
  { id: "C-2", name: "Fr. Jomon Palakkappilly", title: "Assistant Vicar", role: "Associate Pastor", phone: "+91 94470 90002", portrait: AV("photo-1600180758890-6b94519a8ba6", 400), tenure: "2023 – Present" },
  { id: "C-3", name: "Dr. Mathew Kalapurackal", title: "Trustee", role: "Parish Council Secretary", phone: "+91 94470 90003", portrait: AV("photo-1519085360753-af0119f7cbe7", 400), tenure: "2024 – 2026" },
  { id: "C-4", name: "Mrs. Gracy Thundiyil", title: "Trustee", role: "Treasurer & Finance Council", phone: "+91 94470 90004", portrait: AV("photo-1573497019940-1c28c88b4f3e", 400), tenure: "2024 – 2026" },
  { id: "C-5", name: "Mr. Varghese Ambatt", title: "Kaikkaran", role: "Lay Leader & Vice President", phone: "+91 94470 90005", portrait: AV("photo-1566492031773-4f4e44671857", 400), tenure: "2023 – 2025" },
  { id: "C-6", name: "Sr. Little Rose CMC", title: "Catechism Head", role: "Sunday School Coordinator", phone: "+91 94470 90006", portrait: AV("photo-1594744803329-e58b31de8bf5", 400), tenure: "2022 – Present" },
];

export const MASS_TIMINGS: MassTiming[] = [
  { time: "05:45 AM", language: "Malayalam", priest: "Fr. Jomon Palakkappilly" },
  { time: "07:00 AM", language: "Malayalam", priest: "Fr. Sebastian Vadakkumchery" },
  { time: "09:30 AM", language: "English", priest: "Fr. Sebastian Vadakkumchery" },
  { time: "06:00 PM", language: "Malayalam", priest: "Fr. Jomon Palakkappilly" },
];

export const BULLETINS: Bulletin[] = [
  { id: "B-1", title: "Great Lent — Retreat & Confession Schedule", date: "Mar 12, 2026", status: "active", excerpt: "Parish retreat led by Fr. Bobby MCBS. Confessions daily after evening Mass." },
  { id: "B-2", title: "Ward Family Unit Meetings — March", date: "Mar 09, 2026", status: "active", excerpt: "Monthly unit prayer meetings hosted rotationally across all 16 wards." },
  { id: "B-3", title: "First Holy Communion Registration Open", date: "Mar 05, 2026", status: "draft", excerpt: "Registration for the 2026 batch closes on April 15. Contact the catechism office." },
];

export const RECENT_REGISTRATIONS = [
  { member: MEMBERS[11], when: "12 min ago" },
  { member: MEMBERS[9], when: "1 hour ago" },
  { member: MEMBERS[3], when: "3 hours ago" },
  { member: MEMBERS[7], when: "Yesterday" },
  { member: MEMBERS[10], when: "Yesterday" },
];

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
