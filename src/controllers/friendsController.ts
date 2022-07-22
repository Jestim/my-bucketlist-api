import { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import isValidObjectId from '../helpers/isValidObjectId';
import User, { IFriendRequest } from '../models/User';

// GET FRIENDS
const friendsListGet = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    User.findById(req.user.id)
      .populate('friends', ['username', 'firstName', 'lastName', 'age'])
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(400).json({ message: 'Could not find user' });
        }
        return res.json({
          message: 'Successfully retrieved friend list',
          friends: user.friends
        });
      });
  } else {
    return res.status(401).json({ message: 'User is not logged in' });
  }
};

// SEND FRIEND REQUEST
const sendFriendRequestPost = async (req: Request, res: Response) => {
  body('friendid').trim().escape();

  if (!isValidObjectId(req.body.friendid)) {
    return res.status(400).json({ message: 'Could not find user' });
  }

  if (req.user) {
    try {
      // Find current user and add the friendrequest
      const user = await User.findById(req.user.id);

      if (!user) {
        res.status(401);
        throw new Error('Could not find user');
      }

      // Find the friend and add the request to that user
      const friend = await User.findById(req.body.friendid);

      if (!friend) {
        res.status(400);
        throw new Error('Could not find user');
      }

      // Create a friend request with friends id
      const friendRequestToUser: IFriendRequest = {
        userId: req.body.friendid,
        status: 'pending'
      };
      user.friendRequests.push(friendRequestToUser);
      await user.save();

      //   Create a friend request with user id
      const friendRequestToFriend: IFriendRequest = {
        userId: user.id,
        status: 'pending'
      };
      friend.friendRequests.push(friendRequestToFriend);
      await friend.save();

      return res.json({ message: 'Friend request sent' });
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }
  return res.status(401).json({ message: 'User is not logged in' });
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
