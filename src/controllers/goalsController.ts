import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Goal from '../models/Goal';
import User from '../models/User';

// CREATE A NEW GOAL
const createGoalPost = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('title name must not be empty')
    .escape(),

  body('description').trim().escape(),

  body('location').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    }

    if (req.user) {
      const { title, description, location, isPrivate } = req.body;

      const newGoal = new Goal({
        title,
        description,
        location,
        isPrivate,
        creator: req.user.id
      });

      newGoal.save((err, goal) => {
        if (err) {
          return next(err);
        }
        res.json({ message: 'New goal created', goal });
      });
    } else {
      res.status(401).json({ message: 'User is not logged in' });
    }
  }
];

// UPDATE GOAL
const updateGoalPost = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('title name must nor be empty')
    .escape(),

  body('description').trim().escape(),

  body('location').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
    }

    const goalId = req.params.goalid;
    console.log(goalId);

    const { title, description, location } = req.body;
    const updatedInfo = {
      title,
      description,
      location
    };

    if (req.user) {
      Goal.findOneAndUpdate(
        { _id: goalId, creator: req.user.id },
        updatedInfo,
        {
          returnDocument: 'after'
        }
      ).exec((err, goal) => {
        if (err) {
          return next(err);
        }

        console.log(goal);

        if (!goal) {
          res
            .status(403)
            .json({ message: 'You are not the creator of this goal' });
        } else {
          res.status(200).json({ message: 'Goal updated', goal });
        }
      });
    } else {
      res.status(401).json({ message: 'User is not logged in' });
    }
  }
];

// DELETE GOAL
const deleteGoalPost = (req: Request, res: Response, next: NextFunction) => {
  param('goalid').escape();

  const goalId = req.params.goalid;
  if (req.user) {
    Goal.findOneAndDelete({ id: goalId, creator: req.user.id }).exec(
      (err, goal) => {
        if (err) {
          return next(err);
        }

        if (!goal) {
          res
            .status(403)
            .json({ message: 'You are not the creator of this goal' });
        } else {
          res.json({ message: 'Goal deleted', goal });
        }
      }
    );
  } else {
    res.status(401).json({ message: 'User is not logged in' });
  }
};

// GET A USERS GOAL FEED
const userGoalFeedGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    const user = await User.findById(req.user.id);

    if (user) {
      const userIds = user.friends;
      userIds.push(user.id);

      Goal.find()
        .where('creator')
        .in(userIds)
        .exec((err, goals) => {
          if (err) {
            return next(err);
          }

          if (goals) {
            res.json({ message: 'Users goal feed', goals });
          }
        });
    } else {
      res.status(400).json({ message: 'Could not find user' });
    }
  } else {
    res.status(401).json({ message: 'User is not logged in' });
  }
};

const updateGoalPrivacyPut = [
  param('goalid').escape(),

  body('isPrivate', 'Value must be boolean').trim().isBoolean().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array());
    }

    const privacyStatus = req.body.isPrivate === 'true';
    Goal.findByIdAndUpdate(
      req.params.goalid,
      { isPrivate: privacyStatus },
      { returnDocument: 'after' }
    ).exec((err, goal) => {
      if (err) {
        return next(err);
      }

      if (!goal) {
        res.status(400).json({ message: 'Could not find goal' });
      }

      res.json({ message: 'Goal privacy status updated', goal });
    });
  }
];

export default {
  createGoalPost,
  updateGoalPost,
  deleteGoalPost,
  userGoalFeedGet,
  updateGoalPrivacyPut
};
