import 'dotenv/config';
import app from './app';
import dbConnect from './config/dbConnect';

const port = process.env.PORT;

dbConnect();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
