import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import db from '../../config/mockDb';
import User, { IUser } from '../../models/User';
import populateDbUsers from '../../helpers/testHelpers/populateDbUsers';
import logInUser from '../../helpers/testHelpers/logInUser';

const req = request(app);
let jwtToken = '';

beforeAll(async () => {
  await db.connect();
  await populateDbUsers(req);
  const response = await logInUser(req);
  jwtToken = response.body.token;
});

afterAll(async () => {
  await db.clear();
  await db.close();
});

describe('users route', () => {
  describe('given authorized', () => {
    it('should return status 200 and an array of all users', async () => {
      const res = await await req
        .get('/api/users')
        .set('Authorization', `Bearer ${jwtToken}`);

      const usersFromDb: IUser[] = await User.find({});

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(usersFromDb.length);
      expect(res.body[0]._id).toBe(usersFromDb[0].id);
    });

    it('should return status 200 and the updated user', async () => {
      const payload = jwt.decode(jwtToken);

      const updatedInfo = {
        firstName: 'John',
        lastName: 'Doe',
        age: 100
      };

      if (payload) {
        const user = await User.findById(payload.sub);
        if (user) {
          const res = await req
            .put(`/api/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(updatedInfo);

          expect(res.status).toBe(200);
          expect(res.body.message).toBe('User updated');

          expect(res.body.user.firstName).toBe(updatedInfo.firstName);
          expect(res.body.user.lastName).toBe(updatedInfo.lastName);
          expect(res.body.user.age).toBe(updatedInfo.age);
        }
      }
    });

    it('should return status 200 and the deleted user', async () => {
      const payload = jwt.decode(jwtToken);

      if (payload) {
        const user = await User.findById(payload.sub);

        if (user) {
          const res = await req
            .delete(`/api/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

          expect(res.status).toBe(200);
          expect(res.body.message).toBe('User deleted');

          expect(res.body.user.username).toBe(user.username);
        }
      }
    });
  });
});
