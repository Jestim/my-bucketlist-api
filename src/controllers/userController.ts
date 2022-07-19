import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import isValidObjectId from '../helpers/isValidObjectId';
import Goal from '../models/Goal';
import User, { IFriendRequest } from '../models/User';

// GET ALL USERS
const usersListGet = (req: Request, res: Response, next: NextFunction) => {
  User.find({}, { password: 0, updatedAt: 0, __v: 0 }).exec((err, users) => {
    if (err) {
      return next(err);
    }

    return res.json(users);
  });
};

// GET USER BY ID
const userDetailsById = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.params.userid, { password: 0 })
    .populate('friends')
    .exec((err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).json({ message: 'Could not find user' });
      }

      return res.json(user);
    });
};

// GET USER BY USERNAME
const userDetailsByUsername = [
  param('username').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    User.findOne({ username: req.params.username }, { password: 0 })
      .populate('friends')
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(400).json({ message: 'Could not find user' });
        }

        return res.json(user);
      });
  }
];

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
      return res.status(400).json(errors.array());
    }

    if (req.user) {
      if (req.user.id.toString() !== req.params.userid) {
        return res
          .status(403)
          .json({ message: 'You can only update your own user' });
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
          return res.status(400).json({ message: 'Invalid user id' });
        }
        return res.json({
          message: 'User updated',
          user: {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age
          }
        });
      });
    }
  }
];

// DELETE USER
const deleteUserDelete = (req: Request, res: Response, next: NextFunction) => {
  param('userid').escape();

  if (req.user) {
    if (req.user.id.toString() !== req.params.userid) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own user' });
    }
  } else {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  User.findByIdAndDelete(req.params.userid).exec((err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(400).json({ message: 'Could not find user' });
    }
    return res.json({
      message: 'User deleted',
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age
      }
    });
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
      return res.json({ message: 'User has no goals' });
    }
    return res.json(goals);
  });
};

// GET A USERS SPECIFIC GOAL
const userGoalGet = (req: Request, res: Response, next: NextFunction) => {
  param('userid').escape();
  param('goalid').escape();

  Goal.findOne({ creator: req.params.userid, _id: req.params.goalid }).exec(
    (err, goal) => {
      if (err) {
        return next(err);
      }

      if (!goal) {
        return res.json({ message: 'Could not find goal' });
      }
      return res.json(goal);
    }
  );
};

export default {
  usersListGet,
  userDetailsById,
  userDetailsByUsername,
  updateUserPut,
  deleteUserDelete,
  userGoalsGet,
  userGoalGet
};
