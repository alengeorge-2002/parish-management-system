# PROJECT BRIEF: Devagiri St. Joseph Parish Administration ERP (UI/UX Overhaul)

## 🎯 Objective
Redesign the entire desktop web Admin Dashboard UI/UX for the Devagiri St. Joseph Parish ERP system (serving 3,000–4,000 parishioners across 1,000+ households). 
STRICT REQUIREMENT: Do NOT alter or eliminate any existing database fields, filters, modal forms, table columns, or CRUD functionalities. Every button, data property, dropdown, and search parameter must remain intact, but elevated to an ultra-modern SaaS design standard.

---

## 💎 Design System & Visual Guidelines
- Aesthetic Style: Modern, high-density Enterprise SaaS with refined Catholic liturgical aesthetics. Crisp borders, subtle glassmorphism, micro-shadows, and elegant card elevation.
- Theme System:
  * Primary Dark Mode (Default): Background `#0D0F12`, Card Background `#15181E`, Border `#232833`, Primary Gold Accent `#F4C430` / `#E5B320`, Text Primary `#F8FAFC`, Text Secondary `#94A3B8`.
  * Optional Light Mode: Background `#F8FAFC`, Card Background `#FFFFFF`, Border `#E2E8F0`, Primary Gold Accent `#D97706`, Text Primary `#0F172A`, Text Secondary `#64748B`.
- Typography: Inter / Plus Jakarta Sans
  * Page Titles: 22px / Semi-Bold
  * Card / Section Headers: 16px / Semi-Bold
  * Table Cells / Body: 13px / Regular
  * Badges / Status Pills: 11px / Semi-Bold Uppercase
  * Form Labels: 12px / Medium
- Spacing & Layout: 1440px desktop grid (12 columns, 24px gutter), 8px border-radius on inputs/buttons, 12px on cards/modals.

---

## 📐 Global Layout & Navigation Shell

### 1. Left Sidebar Navigation (Fixed 260px)
- Top Brand: Church Emblem / Gold Cross icon with "Devagiri St. Joseph" (Title) & "Parish Administration" (Subtitle).
- Navigation Items (with Lucide icons & active gold pill indicator):
  1. 📊 Dashboard Overview (`/`)
  2. 👥 Parish Members (`/members`)
  3. 🏠 Family Units (`/families`)
  4. 📍 Ward Subdivisions (`/wards`)
  5. ✝️ Clergy & Council (`/clergy`)
  6. 📅 Liturgical Calendar (`/calendar`)
  7. 📢 Announcements & Bulletins (`/announcements`)
- Bottom Section:
  * Server Status Badge: "MongoDB Connected" (Pulse green dot)
  * Admin Profile Card (Avatar, Name: "Fr. Administrator", Role: "Super Admin")
  * Logout Button

### 2. Top Navigation Header
- Left: Dynamic Breadcrumb (e.g., `Parish Admin > Family Households`)
- Center: Global Search Bar (`CMD + K` to search members, family numbers, phones, wards)
- Right:
  * Liturgical Season Badge (e.g., "Season of Great Lent" with purple liturgical dot)
  * Language Switcher (EN | ML)
  * Notification Bell with unread counter
  * Light/Dark Mode Switcher

---

## 🖥️ Screen-by-Screen Functional Specifications

### Screen 1: Dashboard Overview & Analytics
- KPI Summary Row (4 metric cards with sparkline/trend indicators):
  1. Total Parishioners: `3,420` (Male/Female split mini progress bar)
  2. Registered Families: `1,048` (Distributed across 16 wards)
  3. Active Clergy & Council: `12`
  4. Upcoming Liturgical Feasts: `3 this week`
- Main Dashboard Body (2-column layout):
  * Left Column (65%):
    - Recent Member & Family Registrations (quick table with avatars and timestamps)
    - Active Bulletin / Announcements carousel with quick toggle switch (Active / Draft)
  * Right Column (35%):
    - Today's Mass Timings widget (Time, Language, Priest in charge)
    - Ward Distribution chart (Visual breakdown of families per ward)

---

### Screen 2: Parish Members Directory (`/members`)
- Action Toolbar:
  * Search Bar: Live query by Full Name, Baptism Name, Phone Number, or Family Number.
  * Filter Dropdowns: Ward Subdivision, Blood Group (A+, B+, O+, AB+, etc.), Sacramental Status (Baptized, Communion, Confirmed, Married).
  * Action Buttons: "+ Add New Member" (Gold primary button) and "Export CSV/Excel".
- High-Density Data Grid:
  * Columns:
    1. Member Name & Photo (Circular avatar, English name, Malayalam script name subtitle)
    2. Family House Name & Unit ID (Link to Family card)
    3. Ward Subdivision (Pill badge: e.g., "Ward #3 - St. Thomas")
    4. Contact Phone (With direct WhatsApp / Call trigger icons)
    5. Blood Group (Compact tag)
    6. Sacraments (Mini icon badges for Baptism, First Communion, Confirmation, Marriage)
    7. Status (Active / Deceased / Relocated pill)
    8. Actions (View Details, Edit, Delete)

---

### Screen 3: Family Household Management (`/families`)
- Header Toolbar:
  * Search by Family Name, House Name, or Family ID number.
  * Filter by Ward.
  * View Toggle: Card Grid View vs Table View.
  * Button: "+ Add Family Unit".
- Family Card Component:
  * Top: Family Photo Banner (16:9 aspect ratio, clean crop with fallback illustration).
  * Body:
    - Family Name & House Name (e.g., "Thekkedathu House • Family #108").
    - Head of Family Name & Contact Phone.
    - Ward Subdivision Badge ("Ward #1 - St. Mary's").
    - Family Members Avatars Row with "+X more" count.
  * Card Footer: "View Family Roster" link and quick Edit button.

---

### Screen 4: Ward Subdivisions (`/wards`)
- Grid of Ward Cards (15+ units):
  * Ward Number & Saint Patron Name (e.g., "Ward #5 - St. Antony").
  * Ward Representative / President Name & Phone.
  * Total Assigned Families counter badge.
  * Action: "View Ward Household List", "Edit Ward Details".

---

### Screen 5: Clergy & Parish Leadership (`/clergy`)
- Leadership Profile Cards:
  * 1:1 Aspect Ratio Portrait (Vicar with Gold Accent Ring, Asst. Vicar, Trustees).
  * Full Name, Clergy Title, and Pastoral Role.
  * Contact Row: Phone number with direct Call button.
  * Service Tenure / Appointment Period.
  * Actions: "Upload Portrait Image", "Edit Contact & Bio".

---

### Screen 6: Liturgical Calendar & Feast Scheduler (`/calendar`)
- 12-Month Interactive Bilingual Calendar:
  * Color-coded liturgical ribbon (Advent: Purple, Christmas: Gold, Lent: Violet, Easter: White, Ordinary: Green).
  * Daily Feast tile: Saint Name in English & Malayalam script.
  * Mass Timings list for selected date.
  * Button: "+ Schedule Feast / Mass Event".

---

## 🪟 Modal & Drawer Form Specifications

1. Add/Edit Parishioner Modal:
   - 4-Step Form Tabs: 
     1. Personal Info (Full Name, Malayalam Name, Gender, DOB, Blood Group, Photo Upload).
     2. Family Assignment (Family Select Dropdown, Relationship to Head).
     3. Sacramental Dates (Baptism, Holy Communion, Confirmation, Marriage).
     4. Contact (Mobile, Email, Current Address).

2. Add/Edit Family Household Modal:
   - Form Fields: Family Name, House Name, Head of Family select, Ward Subdivision dropdown, Full Address.
   - Multipart Photo Dropzone: Drag-and-drop family portrait with immediate square/banner crop preview and remove button.

3. Schedule Mass / Announcement Modal:
   - Form Fields: Title, Date & Time, Language (Malayalam / English), Celebrant Priest select, Poster Image Upload dropzone.

---

## ✨ Micro-Interactions & States
- Hover States: Subtle border glow (`#F4C43033`) on cards.
- Loading States: Skeleton shimmer loaders on data tables and KPI cards.
- Toast Notifications: Modern floating pill toasts on bottom-right (e.g., "Family record saved successfully").
- Empty States: Clean minimalist icons with "No matching parishioners found" and a clear search reset action.