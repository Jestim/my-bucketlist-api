import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import passport from 'passport';
import cors from 'cors';
import apiRouter from './routes/apiRouter';
import passportConfig from './config/passport';
import jwtAuth from './middleware/jwtAuth';

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passportConfig(passport);
jwtAuth(passport);

app.use('/api', apiRouter);

app.get('/', (req: Request, res: Response) => {
  res.json('Hi there! Got to /api for access to the data');
  console.log('REQUEST RECIEVED');
});

export default app;
