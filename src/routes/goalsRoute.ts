import { Router } from 'express';
import goalsController from '../controllers/goalsController';

const router = Router();

// CREATE A NEW GOAL
router.post('/', goalsController.createGoalPost);

// UPDATE GOAL
router.put('/:goalid', goalsController.updateGoalPost);

// DELETE GOAL
router.delete('/:goalid', goalsController.deleteGoalPost);

// GET A USERS GOAL FEED
router.get('/goals-feed', goalsController.userGoalFeedGet);

export default router;
