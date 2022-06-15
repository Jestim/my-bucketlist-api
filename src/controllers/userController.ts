import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Goal from '../models/Goal';
import User from '../models/User';

// GET ALL USERS
const usersListGet = (req: Request, res: Response, next: NextFunction) => {
  User.find({}, { password: 0, updatedAt: 0, __v: 0 }).exec((err, users) => {
    if (err) {
      return next(err);
    }

    res.json(users);
  });
};

// UPDATE USER
const updateUserPut = [
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must not be empty')
    .escape(),

  body('age').trim().isNumeric().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    }

    if (req.user) {
      if (req.user.id.toString() !== req.params.userid) {
        res.status(403).json({ message: 'You can only update your own user' });
      }

      const { firstName, lastName, age } = req.body;

      const updates = {
        firstName,
        lastName,
        age
      };

      User.findByIdAndUpdate(req.params.userid, updates, {
        returnDocument: 'after'
      }).exec((err, user) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          res.status(400).json({ message: 'Invalid user id' });
        } else {
          res.json({
            message: 'User updated',
            user: {
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              age: user.age
            }
          });
        }
      });
    }
  }
];

// DELETE USER
const deleteUserDelete = (req: Request, res: Response, next: NextFunction) => {
  param('userid').escape();

  if (req.user) {
    if (req.user.id.toString() !== req.params.userid) {
      res.status(403).json({ message: 'You can only delete your own user' });
    }
  } else {
    res.status(401).json({ message: 'User is not logged in' });
  }

  User.findByIdAndDelete(req.params.userid).exec((err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(400).json({ message: 'Could not find user' });
    } else {
      res.json({
        message: 'User deleted',
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age
        }
      });
    }
  });
};

// GET A USERS GOALS
const userGoalsGet = (req: Request, res: Response, next: NextFunction) => {
  param('userid').escape();

  Goal.find({ creator: req.params.userid }).exec((err, goals) => {
    if (err) {
      return next(err);
    }

    if (goals.length === 0) {
      res.json({ message: 'User has no goals' });
    } else {
      res.json(goals);
    }
  });
};

// GET A USERS SPECIFIC GOAL
const userGoalGet = (req: Request, res: Response, next: NextFunction) => {
  param('userid').escape();
  param('goalid').escape();

  Goal.findOne({ creator: req.params.userid, id: req.params.goalid }).exec(
    (err, goal) => {
      if (err) {
        return next(err);
      }

      if (!goal) {
        res.json({ message: 'Could not find goal' });
      } else {
        res.json(goal);
      }
    }
  );
};

// GET FRIENDS
const friendsListGet = (req: Request, res: Response, next: NextFunction) => {
  console.log('GET FRIENDS CALLED');
  if (req.user) {
    User.findById(req.user.id)
      .populate('friends', ['username', 'firstName', 'lastName', 'age'])
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          res.status(400).json({ message: 'Could not find user' });
        } else {
          res.json({
            message: 'Successfully retrieved friend list',
            friends: user.friends
          });
        }
      });
  } else {
    res.status(401).json('User is not logged in');
  }
};

// ADD FRIEND
const addFriendPost = (req: Request, res: Response, next: NextFunction) => {
  body('friendid').trim().escape();

  User.findById(req.body.friendid).exec((err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.json({ message: 'User does not exist' });
    }
  });

  if (req.user) {
    User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { friends: req.body.friendid }
      },
      { returnDocument: 'after' }
    ).exec((err, user) => {
      if (err) {
        next(err);
      }

      if (!user) {
        res.json({ message: 'Could not find user' });
      } else {
        res.json({ message: 'Friend added to friends list', user });
      }
    });
  }
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
        next(err);
      }

      if (!user) {
        res.json({ message: 'Could not find user' });
      } else {
        res.json({ message: 'Friend removed from friends list', user });
      }
    });
  }
};

export default {
  usersListGet,
  updateUserPut,
  deleteUserDelete,
  userGoalsGet,
  userGoalGet,
  friendsListGet,
  addFriendPost,
  removeFriendDelete
};
