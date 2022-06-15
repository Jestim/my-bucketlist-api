import { Router } from 'express';
import goalsController from '../controllers/goalsController';

const router = Router();

// CREATE A NEW GOAL
router.post('/', goalsController.createGoalPost);

// UPDATE A GOALS PRIVACY STATUS
router.put('/:goalid/is-private', goalsController.updateGoalPrivacyPut);

// UPDATE GOAL
router.put('/:goalid', goalsController.updateGoalPost);

// DELETE GOAL
router.delete('/:goalid', goalsController.deleteGoalPost);

// GET A USERS GOAL FEED
router.get('/goals-feed', goalsController.userGoalFeedGet);

export default router;
