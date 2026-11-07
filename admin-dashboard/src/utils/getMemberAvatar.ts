export const MALE_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-male.svg';
export const FEMALE_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-female.svg';
export const DEFAULT_AVATAR_PLACEHOLDER = '/assets/placeholders/avatar-default.svg';

/**
 * Resolves the member avatar URL using gender-based placeholder (male/female/default)
 * or linked household group photo. Under the family-group-photo-only architecture,
 * individual members do not store separate member photos.
 */
export const getMemberAvatar = (member: any): string => {
  if (!member) return DEFAULT_AVATAR_PLACEHOLDER;

  // 1. Gender-based outline placeholder
  const gender = String(member.gender || member.sex || '').toLowerCase().trim();
  if (gender === 'male' || gender === 'm' || gender === 'ആൺ' || gender === 'പുരുഷൻ') {
    return MALE_AVATAR_PLACEHOLDER;
  }
  if (gender === 'female' || gender === 'f' || gender === 'പെൺ' || gender === 'സ്ത്രീ') {
    return FEMALE_AVATAR_PLACEHOLDER;
  }

  // 2. Household group photo fallback if present on member's family object
  if (member.family_photo_url) return member.family_photo_url;
  if (member.familyPhotoUrl) return member.familyPhotoUrl;
  if (member.familyId && typeof member.familyId === 'object') {
    if (member.familyId.family_photo_url) return member.familyId.family_photo_url;
    if (member.familyId.familyPhotoUrl) return member.familyId.familyPhotoUrl;
  }

  // 3. Default fallback
  return DEFAULT_AVATAR_PLACEHOLDER;
};

export default getMemberAvatar;
