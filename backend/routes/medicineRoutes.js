import express from 'express';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from '../controllers/medicineController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMedicines)
  .post(protect, admin, createMedicine);

router.route('/:id')
  .get(getMedicineById)
  .put(protect, admin, updateMedicine)
  .delete(protect, admin, deleteMedicine);

export default router;
