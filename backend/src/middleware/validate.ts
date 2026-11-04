import { Request, Response, NextFunction } from 'express';

/** Shared helper: return 400 with structured error payload */
const reject400 = (
  res: Response,
  details: Record<string, string>
): void => {
  res.status(400).json({ error: 'Validation Error', details });
};

/* ------------------------------------------------------------------ */
/*  User creation                                                       */
/* ------------------------------------------------------------------ */
export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { memberId, role, password, accessKey } = req.body;
  const errors: Record<string, string> = {};

  if (!memberId) {
    errors.memberId = 'memberId is required';
  }

  if (!role || !['admin', 'parishioner'].includes(String(role))) {
    errors.role = 'Role must be "admin" or "parishioner"';
  }

  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (
    accessKey &&
    typeof accessKey === 'string' &&
    accessKey.trim().length > 0 &&
    !/^[a-zA-Z0-9]{4,}$/.test(accessKey.trim())
  ) {
    errors.accessKey =
      'Access key must be alphanumeric (letters and numbers only), minimum 4 characters';
  }

  if (Object.keys(errors).length > 0) {
    reject400(res, errors);
    return;
  }

  // Sanitise
  req.body.memberId = String(memberId).trim();
  req.body.role = String(role).trim();
  next();
};

/* ------------------------------------------------------------------ */
/*  User update — password optional, but if supplied must be valid     */
/* ------------------------------------------------------------------ */
export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { role, password } = req.body;
  const errors: Record<string, string> = {};

  if (role && !['admin', 'parishioner'].includes(String(role))) {
    errors.role = 'Role must be "admin" or "parishioner"';
  }

  if (password && typeof password === 'string' && password.trim()) {
    if (password.trim().length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }

  if (Object.keys(errors).length > 0) {
    reject400(res, errors);
    return;
  }
  next();
};

/* ------------------------------------------------------------------ */
/*  Family creation / update                                           */
/* ------------------------------------------------------------------ */
export const validateCreateFamily = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const rawName = (
    req.body.houseName ||
    req.body.house_name ||
    req.body.familyName ||
    req.body.family_name ||
    ''
  ).trim();

  const wardId = req.body.wardId || req.body.ward_id || req.body.ward;

  const errors: Record<string, string> = {};

  if (!rawName || rawName.length < 2) {
    errors.houseName = 'House / Family name is required (minimum 2 characters)';
  }

  if (!wardId) {
    errors.wardId = 'Ward selection is required';
  }

  if (Object.keys(errors).length > 0) {
    reject400(res, errors);
    return;
  }

  // Sanitise string fields in-place
  if (req.body.houseName) req.body.houseName = req.body.houseName.trim();
  if (req.body.familyName) req.body.familyName = req.body.familyName.trim();
  if (req.body.house_name) req.body.house_name = req.body.house_name.trim();
  if (req.body.family_name) req.body.family_name = req.body.family_name.trim();

  next();
};

/* ------------------------------------------------------------------ */
/*  Member creation / update                                           */
/* ------------------------------------------------------------------ */
export const validateCreateMember = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const firstName = (
    req.body.firstName ||
    req.body.first_name ||
    req.body.fullName ||
    req.body.name ||
    ''
  ).trim();

  const familyId =
    req.body.familyId || req.body.family_id || req.body.family;

  const errors: Record<string, string> = {};

  if (!firstName || firstName.length < 2) {
    errors.firstName = 'Full name is required (minimum 2 characters)';
  }

  if (!familyId) {
    errors.familyId = 'Family selection is required';
  }

  if (Object.keys(errors).length > 0) {
    reject400(res, errors);
    return;
  }

  next();
};

/* ------------------------------------------------------------------ */
/*  Login                                                              */
/* ------------------------------------------------------------------ */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const key = req.body.accessKey || req.body.access_key;

  if (!key || typeof key !== 'string' || !key.trim()) {
    res.status(400).json({ error: 'Access key is required' });
    return;
  }

  next();
};

