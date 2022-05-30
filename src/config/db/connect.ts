import mongoose from 'mongoose';

const connect = () => {
  let mongoDbUri: string;
  if (process.env.MONGODB_URI) {
    mongoDbUri = process.env.MONGODB_URI;
  } else {
    throw new Error('MONGODB_URI IS NOT SET');
  }

  // Set up DB connection
  mongoose.connect(mongoDbUri);
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.on('open', () => console.log('Connected to database'));
};

export default connect;
