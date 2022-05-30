import { Router, Request, Response } from 'express';

const router = Router();

// GET ALL USERS
router.get('/', (req: Request, res: Response) => {
  res.json('Resturns all users');
});

// CREATE NEW USER
router.post('/', (req: Request, res: Response) => {
  res.json('Creates a new user');
});

// UPDATE USER
router.put('/', (req: Request, res: Response) => {
  res.json('Updates a user');
});

// DELETE USER
router.delete('/', (req: Request, res: Response) => {
  res.json('Deletes a user');
});

// GET A USERS GOALS
router.get('/:userid/goals', (req: Request, res: Response) => {
  res.json('Returns a users goals');
});

// GET A USERS GOAL FEED
router.get('/:userid/goalsfeed', (req: Request, res: Response) => {
  res.json('Returns a users goalsfeed');
});

// GET A USERS SPECIFIC GOAL
router.get('/:userid/goals/:goalid', (req: Request, res: Response) => {
  res.json('Returns a users specific goal');
});

// FIND USER(S)
router.get('/find', (req: Request, res: Response) => {
  res.json('Searches for users');
});

// GET SPECIFIC USER
router.get('/:userid', (req: Request, res: Response) => {
  res.json('Returns a specific user');
});

export default router;
