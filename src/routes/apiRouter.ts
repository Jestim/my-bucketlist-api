import { Router } from 'express';
import passport from 'passport';
import usersRoute from './usersRoute';
import goalsRoute from './goalsRoute';
import authRoute from './authRoute';
import friendsRoute from './friendsRoute';

const router = Router();

router.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  usersRoute
);

router.use(
  '/goals',
  passport.authenticate('jwt', { session: false }),
  goalsRoute
);

router.use(
  '/friends',
  passport.authenticate('jwt', { session: false }),
  friendsRoute
);

router.use('/auth', authRoute);

export default router;
