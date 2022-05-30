import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import connect from './config/db/connect';
import apiRouter from './routes/apiRouter';

const port: number = parseInt(process.env.PORT as string, 10);

connect();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter);

app.get('/', (req: Request, res: Response) => {
  console.log('GET request recieved');
  res.json('Hi there! Got to /api for access to the data');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
