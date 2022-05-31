import { Router, Request, Response } from 'express';
import usersRoute from './usersRoute';
import goalsRoute from './goalsRoute';
import authRoute from './authRoute';

const router = Router();

router.use('/users', usersRoute);
router.use('/goals', goalsRoute);
router.use('/auth', authRoute);

router.get('/', (req: Request, res: Response) => {
  res.json('This is the api route');
});

export default router;
