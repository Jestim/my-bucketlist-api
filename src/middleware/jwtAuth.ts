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
        // If jwt has not expired
        if (jwtPayload.exp > Date.now().toString()) {
          User.findById(jwtPayload.sub, (err: Error, user: IUser) => {
            if (err) {
              return done(err, false);
            }

            if (user) {
              return done(null, user);
            }
            return done(null, false);
          });
        } else {
          done(null, false);
        }
      }
    )
  );
};

export default jwtAuth;
