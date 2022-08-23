import { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
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
    res.json({ message: error.message });
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

    res.json({ message: 'Friend request sent' });
  });
};

// UPDATE FRIEND REQUEST STATUS
const acceptOrRejectFriendRequestPut = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  body('friendid').trim().escape();
  body('accepted').isBoolean().escape();

  if (req.user) {
    // If accepted add user to friends array and remove from friendRequests array
    const accepted = Boolean(req.body.accepted);

    // Else update request status to rejected
  }
  return res.status(401).json({ message: 'User is not logged in' });
};

// REMOVE FRIEND
const removeFriendDelete = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  param('friendid').trim().escape();

  if (req.user) {
    User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { friends: req.params.userid }
      },
      { returnDocument: 'after' }
    ).exec((err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.json({ message: 'Could not find user' });
      }
      return res.json({ message: 'Friend removed from friends list', user });
    });
  } else {
    return res.status(401).json({ message: 'User is not logged in' });
  }
};

export default {
  friendsListGet,
  sendFriendRequestPost,
  acceptOrRejectFriendRequestPut,
  removeFriendDelete
};
