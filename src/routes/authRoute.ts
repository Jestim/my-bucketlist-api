import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/authController';

const router = Router();

// SIGN UP NEW USER
router.post('/signup', authController.signUp);

// AUTHENTICATE USER
router.post('/login', authController.logIn);

// CHECK IF USER IS LOGGED IN
router.get('/isLoggedIn', authController.isLoggedIn);

export default router;
