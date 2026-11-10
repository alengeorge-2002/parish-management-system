import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllWards,
  createWard,
  updateWard,
  deleteWard,
  addUnitToWard,
  deleteUnit,
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  importMembersBulk,
} from '../controllers/admin-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';
import { uploadFamilyPhoto, uploadClergyPhoto, uploadClergyAvatar } from '../middleware/upload-middleware';
import { createClergy, updateClergy, deleteClergy } from '../controllers/admin-clergy-controller';
import {
  validateCreateUser,
  validateUpdateUser,
  validateCreateFamily,
  validateCreateMember,
} from '../middleware/validate';

const router = Router();

// Ensure the request has a valid JWT (all admin routes require a logged-in session)
router.use(requireAuth);

// Read-only directory endpoints accessible to all authenticated parishioners
router.get('/wards', getAllWards);
router.get('/families', getAllFamilies);
router.get('/families/:id', getFamilyById);
router.get('/members', getAllMembers);

// Religious houses read access
import {
  getAllReligiousHouses,
  createReligiousHouse,
  updateReligiousHouse,
  deleteReligiousHouse,
  addResidentToHouse,
  removeResidentFromHouse,
} from '../controllers/religious-house-controller';

router.get('/religious-houses', getAllReligiousHouses);
router.post('/religious-houses/:id/residents', addResidentToHouse);
router.delete('/religious-houses/:id/residents/:residentId', removeResidentFromHouse);

import { getClergy, getLeadershipStatus } from '../controllers/clergy-controller';
router.get('/clergy/leadership-status', getLeadershipStatus);
router.get('/clergy', getClergy);

// Ensure the logged-in user is an administrator for write/management endpoints
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.post('/users', validateCreateUser, createUser);
router.put('/users/:id', validateUpdateUser, updateUser);
router.delete('/users/:id', deleteUser);

// Ward management write
router.post('/wards', createWard);
router.post('/wards/:id/units', addUnitToWard);
router.delete('/wards/:wardId/units/:unitId', deleteUnit);
router.delete('/wards/:id/units/:unitId', deleteUnit);
router.delete('/units/:unitId', deleteUnit);
router.put('/wards/:id', updateWard);
router.delete('/wards/:id', deleteWard);

// Family management write
const familyPhotoUpload = uploadFamilyPhoto.fields([
  { name: 'familyPhoto', maxCount: 1 },
  { name: 'family_photo', maxCount: 1 }
]);
router.post('/families', familyPhotoUpload, validateCreateFamily, createFamily);
router.put('/families/:id', familyPhotoUpload, updateFamily);
router.delete('/families/:id', deleteFamily);

// Member management write
router.post('/members/bulk', importMembersBulk);
router.post('/members', validateCreateMember, createMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// Clergy management write
const clergyPhotoUpload = uploadClergyPhoto.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
  { name: 'avatarPhoto', maxCount: 1 },
]);
const handleClergyUpload = (req: any, res: any, next: any) => {
  clergyPhotoUpload(req, res, (err: any) => {
    if (err) return next(err);
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      req.file = files['photo']?.[0] || files['avatar']?.[0] || files['avatarPhoto']?.[0] || req.file;
    }
    next();
  });
};
router.post('/clergy', handleClergyUpload, createClergy);
router.put('/clergy/:id', handleClergyUpload, updateClergy);
router.delete('/clergy/:id', deleteClergy);

// Religious houses management write
router.post('/religious-houses', createReligiousHouse);
router.put('/religious-houses/:id', updateReligiousHouse);
router.delete('/religious-houses/:id', deleteReligiousHouse);


export default router;
