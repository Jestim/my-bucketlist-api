import 'dotenv/config';
import { PassportStatic } from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import User, { IUser } from '../models/User';

const jwtAuth = (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      (jwtPayload, done) => {
        User.findById(jwtPayload.id, (err: Error, user: IUser) => {
          if (err) {
            return done(err, false);
          }

          if (user) {
            return done(null, user);
          }
        });
      }
    )
  );
};

export default jwtAuth;
