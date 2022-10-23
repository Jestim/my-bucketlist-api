import { Router } from 'express';
import friendsController from '../controllers/friendsController';

const router = Router();

// GET FRIENDS
router.get('/', friendsController.friendsListGet);

// GET FRIENDREQUESTS
router.get('/friend-requests', friendsController.friendRequestsGet);

// SEND FRIEND REQUEST
router.post('/', friendsController.sendFriendRequestPost);

// UPDATE FRIEND REQUEST STATUS
router.put('/', friendsController.acceptOrRejectFriendRequestPut);

// REMOVE FRIEND
router.delete('/', friendsController.removeFriendDelete);

export default router;
