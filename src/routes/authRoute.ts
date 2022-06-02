import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

// SIGN UP NEW USER
router.post('/signup', authController.signUp);

// AUTHENTICATE USER
router.post('/login', authController.logIn);

export default router;
