import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

// GET ALL USERS
router.get('/', userController.usersListGet);

// GET FRIENDS
router.get('/friends', userController.friendsListGet);

// SEND FRIEND REQUEST
router.post('/friends', userController.sendFriendRequestPost);

// REMOVE FRIEND
router.delete('/friends/:userid', userController.removeFriendDelete);

// GET USER BY ID
router.get('/:userid', userController.userDetailsById);

// GET USER BY USERNAME
router.get('/username/:username', userController.userDetailsByUsername);

// GET A USERS GOALS
router.get('/:userid/goals', userController.userGoalsGet);

// GET A USERS SPECIFIC GOAL
router.get('/:userid/goals/:goalid', userController.userGoalGet);

// UPDATE USER
router.put('/:userid', userController.updateUserPut);

// DELETE USER
router.delete('/:userid', userController.deleteUserDelete);

export default router;
