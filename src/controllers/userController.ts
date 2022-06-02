import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUser } from '../models/User';

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
    .withMessage('First name must nor be empty')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must nor be empty')
    .escape(),

  body('age').trim().isNumeric().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    }

    const { firstName, lastName, age } = req.body;

    const updates = {
      firstName,
      lastName,
      age
    };

    User.findByIdAndUpdate(req.params.userid, updates, {
      returnDocument: 'after'
    }).exec((err, updatedUser) => {
      if (err) {
        return next(err);
      }

      if (!updatedUser) {
        res.json(new Error('Invalid user id'));
      } else {
        res.json({
          message: 'User updated',
          user: {
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            age: updatedUser.age
          }
        });
      }
    });
  }
];

// DELETE USER
const deleteUserDelete = (req: Request, res: Response, next: NextFunction) => {
  User.findByIdAndDelete(req.params.userid).exec((err, deletedUser) => {
    if (err) {
      return next(err);
    }

    if (!deletedUser) {
      res.json(new Error('Could not find user'));
    } else {
      res.json({
        message: 'User deleted',
        user: {
          username: deletedUser.username,
          email: deletedUser.email,
          firstName: deletedUser.firstName,
          lastName: deletedUser.lastName,
          age: deletedUser.age
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

// FIND USER(S)
const findUsersGet = (req: Request, res: Response) => {
  res.json('Searches for users');
};

// GET SPECIFIC USER
const findUserGet = (req: Request, res: Response) => {
  res.json('Returns a specific user');
};

export default {
  UsersListGet,
  updateUserPut,
  deleteUserDelete,
  userGoalsGet,
  userGoalFeedGet,
  userGoalGet,
  findUsersGet,
  findUserGet
};
