import { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const signUpController = [
  body('username')
    .trim()
    .toLowerCase()
    .isLength({ min: 1 })
    .withMessage('Username must nor be empty')
    .escape(),

  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('You must use a valid email')
    .escape(),

  body('password').trim().isLength({ min: 1 }).escape(),

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

  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, age } = req.body;

    bcrypt.hash(password, 10, (err: Error, hashedPassword: string) => {
      if (err) {
        next(err);
      }

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        age
      });

      newUser.save((error, theUser) => {
        if (error) {
          next(error);
        }

        res.json(theUser);
      });
    });
  }
];

export const logInController = [
  passport.authenticate('local', { session: false }),

  body('username')
    .trim()
    .toLowerCase()
    .isLength({ min: 1 })
    .withMessage('Username must nor be empty')
    .escape(),

  body('password').trim().isLength({ min: 1 }).escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    }

    User.findOne({ username: req.body.username }, (err: Error, user: IUser) => {
      if (err) {
        return next(err);
      }
      const payload = {
        id: user.id,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7
      };

      const jwtSecret = process.env.JWT_SECRET;

      const token = jwt.sign(payload, jwtSecret);

      res.json({ token });
    });
  }
];
