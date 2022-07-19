import { Router } from 'express';
import friendsController from '../controllers/friendsController';

const router = Router();

// GET FRIENDS
router.get('/', friendsController.friendsListGet);

// SEND FRIEND REQUEST
router.post('/', friendsController.sendFriendRequestPost);

// UPDATE FRIEND REQUEST STATUS
router.put('/', friendsController.acceptOrRejectFriendRequestPut);

// REMOVE FRIEND
router.delete('/:userid', friendsController.removeFriendDelete);

export default router;
