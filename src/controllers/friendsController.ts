import { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import isValidObjectId from '../helpers/isValidObjectId';
import FriendRequest from '../models/FriendRequest';
import User from '../models/User';

// GET FRIENDS
const friendsListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  try {
    const user = await User.findById(req.user.id).populate('friends');

    if (!user) {
      return res.json({ message: 'User not found' });
    }

    if (user.friends.length === 0) {
      return res.json({ message: 'No friends found' });
    }

    return res.json({
      message: 'Successfully retrieved friend list',
      friends: user.friends
    });
  } catch (error: any) {
    return res.json({ message: error.message });
  }
};

// SEND FRIEND REQUEST
const sendFriendRequestPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  body('friendid').trim().escape();

  if (!isValidObjectId(req.body.friendid)) {
    return res.status(400).json({ message: 'UserId is invalid' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  // Create a new friendRequest with userId as requester and friendId as recipient
  const newFriendRequest = new FriendRequest({
    requester: req.user.id,
    recipient: req.body.friendid,
    status: 'pending'
  });

  newFriendRequest.save((error) => {
    if (error) {
      return next(error);
    }

    return res.json({ message: 'Friend request sent' });
  });
};

// UPDATE FRIEND REQUEST STATUS
const acceptOrRejectFriendRequestPut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  body('friendid').trim().escape();
  body('accepted').isBoolean().escape();

  if (!req.user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  // If accepted add user to both users friends array and remove request from friendRequests array
  const isAccepted = req.body.accepted === 'true';

  if (isAccepted) {
    try {
      const currentUser = await User.findById(req.user.id);
      const friend = await User.findById(req.body.friendid);
      if (!currentUser || !friend) {
        res.status(404);
        throw new Error('Could not find user');
      }

      currentUser.friends.push(friend.id);
      friend.friends.push(currentUser.id);
      //   HOW TO ERROR HANDLE IF FRIENDS THROWS ERROR (REVERT SAVED CHANGE IN CURRENTUSER)
      await currentUser.save();
      await friend.save();

      await FriendRequest.findOneAndDelete({
        requester: friend.id,
        recipient: currentUser.id
      });

      return res.json({ message: 'Friend request accepted' });
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  // Else update request status to rejected
  try {
    const friendRequest = await FriendRequest.findOne({
      requester: req.body.friendid,
      recipient: req.user.id
    });

    if (!friendRequest) {
      res.status(404);
      throw new Error('Could not find friendRequest');
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    return res.json({ message: 'Friend request rejected' });
  } catch (error: any) {
    return res.json({ message: error.message });
  }
};

// REMOVE FRIEND
const removeFriendDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  body('friendid').trim().escape();

  if (!req.user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  try {
    // Remove friend from currentUsers friends array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { friends: req.body.friendid }
    });

    // Remove currentUser from friends friends array
    await User.findByIdAndUpdate(req.body.friendid, {
      $pull: { friends: new mongoose.Types.ObjectId(req.user.id) }
    });

    return res.json({ message: 'Friend deleted' });
  } catch (error: any) {
    console.log(error);

    return res.json({ message: error.message });
  }
};

export default {
  friendsListGet,
  sendFriendRequestPost,
  acceptOrRejectFriendRequestPut,
  removeFriendDelete
};
