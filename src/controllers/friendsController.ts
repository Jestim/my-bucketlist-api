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
          friends: user.friends,
          friendRequests: user.friendRequests
        });
      });
  } else {
    return res.status(401).json({ message: 'User is not logged in' });
  }
};

// SEND FRIEND REQUEST
const sendFriendRequestPost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  body('friendid').trim().escape();

  if (!isValidObjectId(req.body.friendid)) {
    return res.status(400).json({ message: 'Could not find user' });
  }

  if (req.user) {
    // Create a friend request with friends id
    const friendrequest: IFriendRequest = {
      userId: req.body.friendid,
      status: 'pending'
    };

    // Find current user and add the friendrequest
    User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { friendRequests: friendrequest }
      },
      { returnDocument: 'after' }
    ).exec((err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).json({ message: 'Could not find user' });
      }
      // Find the friend and add the request to that user
      const currentUser: IFriendRequest = {
        userId: user.id,
        status: 'pending'
      };

      User.findByIdAndUpdate(req.body.friendid, {
        $addToSet: { friendRequests: currentUser }
      }).exec((error, friend) => {
        if (error) {
          return next(error);
        }

        if (!friend) {
          return res.status(400).json({ message: 'Could not find user' });
        }
        return res.json({ message: 'Friend request sent', user });
      });
    });
  } else {
    return res.status(401).json({ message: 'User is not logged in' });
  }
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
    // If accepted add user to friends list
    console.log(req.body);

    // Else update request status to rejected
  }

  res.end();
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
  }
};

export default {
  friendsListGet,
  sendFriendRequestPost,
  acceptOrRejectFriendRequestPut,
  removeFriendDelete
};
