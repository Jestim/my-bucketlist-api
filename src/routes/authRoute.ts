import { Router } from 'express';
import passport from 'passport';
import {
  signUpController,
  logInController
} from '../controllers/authController';

const router = Router();

// SIGN UP NEW USER
router.post('/signup', signUpController);

// AUTHENTICATE USER
router.post('/login', logInController);

export default router;
