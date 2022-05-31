import { Error } from 'mongoose';
import { Strategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import User, { IUser } from '../models/User';

const passportConfig = (passport: PassportStatic) => {
  passport.use(
    new Strategy({ session: false }, (username, password, done) => {
      User.findOne({ username }, (err: Error, user: IUser) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }

        bcrypt.compare(
          password,
          user.password,
          (error: Error, result: boolean) => {
            if (result) {
              return done(null, user);
            }
            return done(null, false, { message: 'Incorrect password' });
          }
        );
      });
    })
  );
};

export default passportConfig;

// passport.use(
//   new Strategy((username, password, done) => {
//     User.findOne({ username }, (err: Error, user: IUser) => {
//       if (err) {
//         done(err);
//       }

//       if (!user) {
//         return done(null, false, { message: 'Incorrect username' });
//       }

//       bcrypt.compare(
//         password,
//         user.password,
//         (error: Error, result: boolean) => {
//           if (result) {
//             return done(null, user);
//           }
//           return done(null, false, { message: 'Incorrect password' });
//         }
//       );
//     });
//   })
// );
