// src/utils/api-client.ts

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export interface UserSession {
  token: string;
  role: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export const getSession = (): UserSession | null => {
  const sessionStr = localStorage.getItem('admin_session');
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (_) {
    return null;
  }
};

export const setSession = (session: UserSession) => {
  localStorage.setItem('admin_session', JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem('admin_session');
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const session = getSession();
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401 || response.status === 403) {
    if (response.status === 401) {
      clearSession();
    }
  }
  
  if (!response.ok) {
    let errMsg = 'An API error occurred';
    try {
      const errData = await response.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch (_) {
      // ignore
    }
    throw new Error(errMsg);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

export const wardsApi = {
  list: () => fetchApi('/admin/wards'),
  create: (wardData: { number?: number; wardNumber?: number; patron?: string; wardName?: string; representativeName?: string; contactPhone?: string }) => fetchApi('/admin/wards', {
    method: 'POST',
    body: JSON.stringify(wardData),
  }),
  update: (id: string | number, wardData: { number?: number; wardNumber?: number; patron?: string; wardName?: string; representativeName?: string; contactPhone?: string }) => fetchApi(`/admin/wards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(wardData),
  }),
  delete: (id: string | number) => fetchApi(`/admin/wards/${id}`, {
    method: 'DELETE',
  }),
};

export interface FamilyData {
  familyName: string;
  headOfFamily?: string;
  wardId?: string | number;
  wardNumber?: number;
  unitNumber?: string;
  houseName?: string;
  homeAddress?: string;
  familyPhotoUrl?: string;
  contactNumber?: string;
  phone?: string;
  address?: string;
}

export const familiesApi = {
  list: () => fetchApi('/admin/families'),
  create: (data: FamilyData | FormData) => fetchApi('/admin/families', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id: string | number, data: FamilyData | FormData) => fetchApi(`/admin/families/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/admin/families/${id}`, {
    method: 'DELETE',
  }),
};

export interface MemberData {
  familyId?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  nameMl?: string;
  malayalamName?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  baptismDate?: string;
  communionDate?: string;
  confirmationDate?: string;
  marriageDate?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  currentAddress?: string;
  relationshipRole?: string;
  relationshipToHead?: string;
  isHeadOfHousehold?: boolean;
  sacraments?: string[];
  status?: string;
}

export const membersApi = {
  list: (params?: string | { search?: string; familyId?: string; family_id?: string }) => {
    if (typeof params === 'string') {
      return fetchApi(params ? `/admin/members?search=${encodeURIComponent(params)}` : '/admin/members');
    }
    if (params && typeof params === 'object') {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.familyId) query.set('familyId', params.familyId);
      if (params.family_id) query.set('family_id', params.family_id);
      const queryString = query.toString();
      return fetchApi(queryString ? `/admin/members?${queryString}` : '/admin/members');
    }
    return fetchApi('/admin/members');
  },
  create: (data: MemberData | FormData) => fetchApi('/admin/members', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id: string | number, data: Partial<MemberData> | FormData) => fetchApi(`/admin/members/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/admin/members/${id}`, {
    method: 'DELETE',
  }),
  importBulk: (members: any[]) => fetchApi('/members/bulk', {
    method: 'POST',
    body: JSON.stringify({ members }),
  }),
};

export interface ReligiousHouseData {
  name: string;
  category: string;
  superiorInCharge?: string;
  residentCount?: number;
  contactNumber?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
}

export const religiousHousesApi = {
  list: () => fetchApi('/admin/religious-houses'),
  create: (data: ReligiousHouseData) => fetchApi('/admin/religious-houses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string | number, data: Partial<ReligiousHouseData>) => fetchApi(`/admin/religious-houses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/admin/religious-houses/${id}`, {
    method: 'DELETE',
  }),
  addResident: (houseId: string | number, residentData: any) => fetchApi(`/admin/religious-houses/${houseId}/residents`, {
    method: 'POST',
    body: JSON.stringify(residentData),
  }),
  deleteResident: (houseId: string | number, residentId: string | number) => fetchApi(`/admin/religious-houses/${houseId}/residents/${residentId}`, {
    method: 'DELETE',
  }),
};

export interface ClergyData {
  name: string;
  title: string;
  role?: string;
  phone?: string;
  email?: string;
  bio?: string;
  tenureStart?: string;
  tenureEnd?: string;
  isCurrent?: boolean;
  avatarUrl?: string;
}

export const clergyApi = {
  list: () => fetchApi('/admin/clergy'),
  create: (data: ClergyData | FormData) => fetchApi('/admin/clergy', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id: string | number, data: ClergyData | FormData) => fetchApi(`/admin/clergy/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/admin/clergy/${id}`, {
    method: 'DELETE',
  }),
};

export const usersApi = {
  list: () => fetchApi('/admin/users'),
  create: (memberId: string | number, role: string, accessKey: string) => fetchApi('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ memberId, role, accessKey }),
  }),
  update: (id: string | number, role: string) => fetchApi(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  delete: (id: string | number) => fetchApi(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
};

export const statsApi = {
  get: () => fetchApi('/admin/wards').then(async (wards: any[]) => {
    const families = await familiesApi.list();
    const members = await membersApi.list();
    return {
      wards: Array.isArray(wards) ? wards.length : 0,
      families: Array.isArray(families) ? families.length : 0,
      members: Array.isArray(members) ? members.length : 0,
      users: 12,
    };
  }).catch(() => ({
    wards: 0,
    families: 0,
    members: 0,
    users: 0,
  })),
};

export interface AnnouncementData {
  title: string;
  content: string;
  imageUrl?: string;
  poster_url?: string;
  priority?: string;
  expiry_date?: string;
  status?: string;
}

export const announcementsApi = {
  list: () => fetchApi('/announcements'),
  create: (data: AnnouncementData) => fetchApi('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string | number, data: AnnouncementData) => fetchApi(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/announcements/${id}`, {
    method: 'DELETE',
  }),
};

export interface EventData {
  title: string;
  title_en?: string;
  title_ml?: string;
  eventDate?: string;
  target_date?: string;
  massTime?: string;
  mass_time?: string;
  typeBadge?: string;
  type_badge?: string;
  location?: string;
  description?: string;
  description_en?: string;
  description_ml?: string;
  season?: string;
}

export const eventsApi = {
  list: () => fetchApi('/feasts'),
  create: (data: EventData) => fetchApi('/feasts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/feasts/${id}`, {
    method: 'DELETE',
  }),
};

export const calendarApi = {
  list: () => fetchApi('/calendar'),
  getByDate: (dateString: string) => fetchApi(`/calendar/${dateString}`),
};

export const ministriesApi = {
  list: () => fetchApi('/directory/ministries'),
  create: (data: any) => fetchApi('/admin/ministries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string | number, data: any) => fetchApi(`/admin/ministries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchApi(`/admin/ministries/${id}`, {
    method: 'DELETE',
  }),
  addMember: (ministryId: string | number, memberId: string | number, role: string) => fetchApi(`/ministries/${ministryId}/members`, {
    method: 'POST',
    body: JSON.stringify({ memberId, role }),
  }),
  removeMember: (ministryId: string | number, memberId: string | number) => fetchApi(`/ministries/${ministryId}/members/${memberId}`, {
    method: 'DELETE',
  }),
};

export const parishCouncilApi = {
  list: () => fetchApi('/parish-council/seats').catch(() => fetchApi('/directory/parish-council')),
  createSeat: (data: { roleTitle?: string; englishTitle?: string; malayalamTitle?: string; category?: string; wardNumber?: number; term?: string }) => fetchApi('/parish-council/seats', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  assignSeat: (id: string | number, data: { memberId?: string | number; term?: string; occupantName?: string; phone?: string }) => fetchApi(`/parish-council/seats/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  vacateSeat: (id: string | number) => fetchApi(`/parish-council/seats/${id}/vacate`, {
    method: 'PUT',
  }),
  updateSeat: (id: string | number, data: any) => fetchApi(`/parish-council/seats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSeat: (id: string | number) => fetchApi(`/admin/parish-council/${id}`, {
    method: 'DELETE',
  }),
};

