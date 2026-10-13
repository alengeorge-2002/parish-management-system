export const MALE_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-male.svg';
export const FEMALE_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-female.svg';
export const DEFAULT_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-default.svg';

/**
 * Resolves the member avatar URL using member photo, linked family photo,
 * or gender-based placeholder (male/female/default).
 */
export const getMemberAvatar = (member: any): string => {
  if (!member) return DEFAULT_AVATAR_PLACEHOLDER;

  // 1. Direct member photo if present
  if (member.photo) return member.photo;
  if (member.avatarPhoto) return member.avatarPhoto;
  if (member.photo_url) return member.photo_url;
  if (member.avatar_url) return member.avatar_url;
  if (member.raw?.photo_url) return member.raw.photo_url;

  // 2. Fallback to linked family household photo if available
  if (member.familyId && typeof member.familyId === 'object') {
    if (member.familyId.familyPhoto) return member.familyId.familyPhoto;
    if (member.familyId.family_photo_url) return member.familyId.family_photo_url;
  }
  if (member.familyPhoto) return member.familyPhoto;
  if (member.family_photo_url) return member.family_photo_url;

  // 3. Gender-based placeholder
  const gender = String(member.gender || member.sex || '').toLowerCase().trim();
  if (gender === 'male' || gender === 'm' || gender === 'ആൺ' || gender === 'പുരുഷൻ') {
    return MALE_AVATAR_PLACEHOLDER;
  }
  if (gender === 'female' || gender === 'f' || gender === 'പെൺ' || gender === 'സ്ത്രീ') {
    return FEMALE_AVATAR_PLACEHOLDER;
  }

  // 4. Default fallback
  return DEFAULT_AVATAR_PLACEHOLDER;
};

export default getMemberAvatar;
