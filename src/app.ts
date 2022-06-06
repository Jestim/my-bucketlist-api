import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import passport from 'passport';
import apiRouter from './routes/apiRouter';
import passportConfig from './config/passport';
import jwtAuth from './middleware/jwtAuth';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passportConfig(passport);
jwtAuth(passport);

app.use('/api', apiRouter);

app.get('/', (req: Request, res: Response) => {
  res.json('Hi there! Got to /api for access to the data');
});

// JWT PROTECTED TEST ROUTE
app.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json('this is a jwt protected route');
  }
);

export default app;
