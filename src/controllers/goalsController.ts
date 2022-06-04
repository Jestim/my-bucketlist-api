import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Goal from '../models/Goal';

const createGoalPost = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('title name must not be empty')
    .escape(),

  body('description').trim().escape(),

  body('location').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    console.log('saved');
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

      newGoal.save((err, theGoal) => {
        if (err) {
          return next(err);
        }
        res.json({ message: 'New goal created', theGoal });
      });
    } else {
      res.status(401).json({ message: 'User is not logged in' });
    }
  }
];

const updateGoalPost = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('title name must nor be empty')
    .escape(),

  body('description').trim().escape(),

  body('location').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const goalId = req.params.goalid;

    const { title, description, location } = req.body;
    const updatedInfo = {
      title,
      description,
      location
    };

    if (req.user) {
      Goal.findOneAndUpdate({ id: goalId, creator: req.user.id }, updatedInfo, {
        returnDocument: 'after'
      }).exec((err, goal) => {
        if (err) {
          return next(err);
        }

        if (!goal) {
          res
            .status(403)
            .json({ message: 'You are not the creator of this goal' });
        } else {
          res.status(200).json({ message: 'Goal update', goal });
        }
      });
    } else {
      res.status(401).json({ message: 'User is not logged in' });
    }
  }
];

const deleteGoalPost = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('title name must nor be empty')
    .escape(),

  body('description').trim().escape(),

  body('location').trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    res.json('Delete a goal');
  }
];

export default {
  createGoalPost,
  updateGoalPost,
  deleteGoalPost
};
