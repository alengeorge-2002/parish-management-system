export type Lang = "en" | "ml";

type Dict = Record<string, { en: string; ml: string }>;

export const t: Dict = {
  // shell
  appTitle: { en: "Devagiri St. Joseph", ml: "ദേവഗിരി സെന്റ് ജോസഫ്" },
  appSubtitle: { en: "Parish Administration", ml: "ഇടവക ഭരണം" },
  serverConnected: { en: "API Server Online", ml: "API സെർവർ ഓൺലൈൻ" },
  superAdmin: { en: "Administrator", ml: "അഡ്മിനിസ്ട്രേറ്റർ" },
  logout: { en: "Log out", ml: "പുറത്തുകടക്കുക" },
  searchPlaceholder: {
    en: "Search members, family no., phone, ward…",
    ml: "അംഗങ്ങൾ, കുടുംബ നമ്പർ, ഫോൺ, വാർഡ്…",
  },
  liturgicalSeason: { en: "Season of Great Lent", ml: "വലിയ നോമ്പുകാലം" },

  // nav
  nav_dashboard: { en: "Dashboard Overview", ml: "ഡാഷ്‌ബോർഡ്" },
  nav_wards: { en: "Wards Management", ml: "വാർഡ് നിർവഹണം" },
  nav_families: { en: "Families Management", ml: "കുടുംബ നിർവഹണം" },
  nav_members: { en: "Members Management", ml: "അംഗ നിർവഹണം" },
  nav_users: { en: "User Management", ml: "ഉപയോക്തൃ നിർവഹണം" },
  nav_announcements: { en: "Announcements Management", ml: "അറിയിപ്പ് നിർവഹണം" },
  nav_calendar: { en: "Calendar Management", ml: "കലണ്ടർ നിർവഹണം" },
  nav_clergy: { en: "Clergy Management", ml: "വൈദിക നിർവഹണം" },
  nav_houses: { en: "Religious Houses", ml: "സന്യാസ ഭവനങ്ങൾ" },
  nav_ministries: { en: "Ministries Management", ml: "സേവന നിർവഹണം" },
  nav_council: { en: "Parish Council Seats", ml: "ഇടവക കൗൺസിൽ സീറ്റുകൾ" },

  // dashboard
  totalParishioners: { en: "Total Parishioners", ml: "മൊത്തം ഇടവകാംഗങ്ങൾ" },
  registeredFamilies: { en: "Registered Families", ml: "രജിസ്റ്റർ ചെയ്ത കുടുംബങ്ങൾ" },
  activeClergy: { en: "Clergy & Council", ml: "വൈദികരും കൗൺസിലും" },
  upcomingFeasts: { en: "Upcoming Feasts", ml: "വരാനിരിക്കുന്ന തിരുനാളുകൾ" },
  recentRegistrations: { en: "Recent Registrations", ml: "സമീപകാല രജിസ്ട്രേഷനുകൾ" },
  bulletins: { en: "Bulletins & Announcements", ml: "ബുള്ളറ്റിനുകളും അറിയിപ്പുകളും" },
  todaysMass: { en: "Today's Mass Timings", ml: "ഇന്നത്തെ കുർബാന സമയം" },
  wardDistribution: { en: "Families per Ward", ml: "വാർഡ് തിരിച്ചുള്ള കുടുംബങ്ങൾ" },
  thisWeek: { en: "3 this week", ml: "ഈ ആഴ്ച 3" },
  across16Wards: { en: "Across registered wards", ml: "വാർഡുകളിൽ" },
  active: { en: "Active", ml: "സജീവം" },

  // members
  addMember: { en: "Add New Member", ml: "പുതിയ അംഗം" },
  exportCsv: { en: "Export CSV", ml: "CSV കയറ്റുമതി" },
  colMember: { en: "Member", ml: "അംഗം" },
  colFamily: { en: "Family / Unit", ml: "കുടുംബം / യൂണിറ്റ്" },
  colWard: { en: "Ward", ml: "വാർഡ്" },
  colContact: { en: "Contact", ml: "ബന്ധപ്പെടുക" },
  colBlood: { en: "Blood", ml: "രക്തഗ്രൂപ്പ്" },
  colSacraments: { en: "Sacraments", ml: "കൂദാശകൾ" },
  colStatus: { en: "Status", ml: "സ്ഥിതി" },
  colActions: { en: "Actions", ml: "പ്രവർത്തനങ്ങൾ" },
  filterWard: { en: "All Wards", ml: "എല്ലാ വാർഡുകൾ" },
  filterBlood: { en: "Blood Group", ml: "രക്തഗ്രൂപ്പ്" },
  filterSacrament: { en: "Sacramental Status", ml: "കൂദാശ സ്ഥിതി" },
  noResults: { en: "No matching parishioners found", ml: "ഇടവകാംഗങ്ങളൊന്നും കണ്ടെത്തിയില്ല" },
  resetSearch: { en: "Reset filters", ml: "ഫിൽട്ടറുകൾ പുനഃസജ്ജമാക്കുക" },

  // families
  addFamily: { en: "Add Family Unit", ml: "കുടുംബ യൂണിറ്റ്" },
  gridView: { en: "Grid", ml: "ഗ്രിഡ്" },
  tableView: { en: "Table", ml: "ടേബിൾ" },
  headOfFamily: { en: "Head of Family", ml: "കുടുംബനാഥൻ" },
  viewRoster: { en: "View Family Roster", ml: "കുടുംബ പട്ടിക കാണുക" },
  more: { en: "more", ml: "കൂടുതൽ" },

  // wards
  wardRep: { en: "Ward Representative", ml: "വാർഡ് പ്രതിനിധി" },
  families: { en: "families", ml: "കുടുംബങ്ങൾ" },
  viewHouseholds: { en: "View Households", ml: "കുടുംബങ്ങൾ കാണുക" },
  editDetails: { en: "Edit", ml: "തിരുത്തുക" },

  // clergy
  callNow: { en: "Call", ml: "വിളിക്കുക" },
  editContact: { en: "Edit Contact & Bio", ml: "വിവരങ്ങൾ തിരുത്തുക" },
  tenure: { en: "Tenure", ml: "സേവന കാലം" },

  // calendar
  scheduleFeast: { en: "Schedule Feast / Mass", ml: "തിരുനാൾ / കുർബാന" },
  massTimings: { en: "Mass Timings", ml: "കുർബാന സമയം" },

  // announcements
  newBulletin: { en: "New Bulletin", ml: "പുതിയ ബുള്ളറ്റിൻ" },
  draft: { en: "Draft", ml: "ഡ്രാഫ്റ്റ്" },

  // modal
  save: { en: "Save", ml: "സംരക്ഷിക്കുക" },
  cancel: { en: "Cancel", ml: "റദ്ദാക്കുക" },
  next: { en: "Next", ml: "അടുത്തത്" },
  back: { en: "Back", ml: "പിന്നോട്ട്" },
  personalInfo: { en: "Personal Info", ml: "വ്യക്തിവിവരം" },
  familyAssignment: { en: "Family Assignment", ml: "കുടുംബ നിയമനം" },
  sacramentalDates: { en: "Sacramental Dates", ml: "കൂദാശ തീയതികൾ" },
  contactStep: { en: "Contact", ml: "ബന്ധം" },
  savedToast: { en: "Record saved successfully", ml: "രേഖ വിജയകരമായി സംരക്ഷിച്ചു" },
};

export const tr = (key: string, lang: Lang): string =>
  t[key] ? t[key][lang] : key;
