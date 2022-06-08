import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import User from '../models/User';

// GET ALL USERS
const UsersListGet = (req: Request, res: Response, next: NextFunction) => {
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
        res.status(403).json('You can only update your own user');
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
    res.status(401).json('User is not logged in');
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
const userGoalsGet = (req: Request, res: Response) => {
  res.json('Returns a users goals');
};

// GET A USERS GOAL FEED
const userGoalFeedGet = (req: Request, res: Response) => {
  res.json('Returns a users goalsfeed');
};

// GET A USERS SPECIFIC GOAL
const userGoalGet = (req: Request, res: Response) => {
  res.json('Returns a users specific goal');
};

export default {
  UsersListGet,
  updateUserPut,
  deleteUserDelete,
  userGoalsGet,
  userGoalFeedGet,
  userGoalGet
};
