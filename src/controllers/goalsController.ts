import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
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
          res.status(200).json({ message: 'Goal updated', goal });
        }
      });
    } else {
      res.status(401).json({ message: 'User is not logged in' });
    }
  }
];

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

export default {
  createGoalPost,
  updateGoalPost,
  deleteGoalPost
};
