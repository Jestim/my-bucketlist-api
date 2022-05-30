import { Router, Request, Response } from 'express';

const router = Router();

// CREATE A NEW GOAL
router.post('/', (req: Request, res: Response) => {
  res.json('Creates a new goal');
});

// UPDATE GOAL
router.put('/:goalid', (req: Request, res: Response) => {
  res.json('Updates a goal');
});

// DELETE GOAL
router.delete('/:goalid', (req: Request, res: Response) => {
  res.json('Deletes a goal');
});

export default router;
