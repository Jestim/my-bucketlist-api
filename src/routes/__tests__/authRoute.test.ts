import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import db from '../../config/mockDb';
import User from '../../models/User';
import {
  userInput,
  loginInfo,
  loginInfoWrongUsername,
  loginInfoWrongPw
} from '../../helpers/testHelpers/authRouteHelpers';

beforeAll(async () => {
  await db.connect();
});
afterAll(async () => {
  await db.clear();
  await db.close();
});

const req = request(app);

describe('authentication route', () => {
  describe('/api/auth/signup POST', () => {
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

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Username is already in use');
        expect(res.body.errors[1].msg).toBe('Email is already in use');
      });
    });
  });

  describe('/api/auth/login POST', () => {
    describe('given valid username and password', () => {
      it('should return status 200 and a jwt with userid in payload', async () => {
        const res = await req
          .post('/api/auth/login')
          .type('form')
          .send(loginInfo);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeTruthy();

        if (res.body.token) {
          const payload = jwt.decode(res.body.token);
          expect(payload).toBeTruthy();

          if (payload) {
            const user = await User.findById(payload.sub);
            expect(user).toBeTruthy();
          }
        }
      });
    });

    describe('given invalid username', () => {
      it('should return status 401', async () => {
        const res = await req
          .post('/api/auth/login')
          .type('form')
          .send(loginInfoWrongUsername);

        expect(res.status).toBe(401);
      });
    });

    describe('given invalid password', () => {
      it('should return status 401', async () => {
        const res = await req
          .post('/api/auth/login')
          .type('form')
          .send(loginInfoWrongPw);

        expect(res.status).toBe(401);
      });
    });
  });
});
