/** Shared front-end validation helpers */

export const validatePhone = (v: string): boolean =>
  /^[+]?[0-9\s\-]{7,15}$/.test(v.trim());

export const validateEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  valid: boolean;
}

export const validatePassword = (v: string): PasswordStrength => ({
  minLength: v.length >= 8,
  hasUpper: /[A-Z]/.test(v),
  hasLower: /[a-z]/.test(v),
  hasDigit: /[0-9]/.test(v),
  valid:
    v.length >= 8 &&
    /[A-Z]/.test(v) &&
    /[a-z]/.test(v) &&
    /[0-9]/.test(v),
});

export const validateAccessKey = (v: string): boolean =>
  /^[a-zA-Z0-9]{4,}$/.test(v.trim());

export const VALID_BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

