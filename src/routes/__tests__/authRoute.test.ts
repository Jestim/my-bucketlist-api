import request from 'supertest';
import app from '../../app';
import db from '../../config/mockDb';
import User from '../../models/User';

beforeAll(async () => {
  await db.connect();
});
afterAll(async () => {
  await db.clear();
  await db.close();
});

const req = request(app);

const userInput = {
  username: 'test',
  email: 'test@test.com',
  password: 'abc',
  firstName: 'test',
  lastName: 'testson',
  age: 20
};

describe('authentication route', () => {
  describe('signup route', () => {
    describe('given valid registration info', () => {
      it('should return status 200 and user info with message "User created"', async () => {
        const res = await req
          .post('/api/auth/signup')
          .type('form')
          .send(userInput);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User created');

        const { password, ...userRes } = userInput;
        expect(res.body.user).toMatchObject(userRes);
      });

      it('should save user to database and hash the password', async () => {
        const user = await User.findOne({ username: userInput.username });

        if (user) {
          expect(user.email).toBe(userInput.email);
          expect(user.password).not.toBe(userInput.password);
        }
      });
    });

    describe('given invalid registration info', () => {
      it('should retrun status 400 and an array of errors', async () => {
        const res = await req.post('/api/auth/signup').type('form').send();

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeTruthy();
        expect(res.body.errors).toBeInstanceOf(Array);
      });
    });

    describe('given username and email is already taken', () => {
      it('should return status 400 and error message', async () => {
        const res = await req
          .post('/api/auth/signup')
          .type('form')
          .send(userInput);

        console.log(res.body.errors);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Username is already in use');
        expect(res.body.errors[1].msg).toBe('Email is already in use');
      });
    });
  });
});
