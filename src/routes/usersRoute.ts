import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

// GET ALL USERS
router.get('/', userController.UsersListGet);

// GET A USERS GOALS
router.get('/:userid/goals', userController.userGoalsGet);

// GET A USERS GOAL FEED
router.get('/:userid/goals-feed', userController.userGoalFeedGet);

// GET A USERS SPECIFIC GOAL
router.get('/:userid/goals/:goalid', userController.userGoalGet);

// UPDATE USER
router.put('/:userid', userController.updateUserPut);

// DELETE USER
router.delete('/:userid', userController.deleteUserDelete);

// ADD FRIEND
router.post('/friends/', userController.addFriendGet);

// REMOVE FRIEND
router.delete('/friends/:userid', userController.removeFriendDelete);

export default router;
