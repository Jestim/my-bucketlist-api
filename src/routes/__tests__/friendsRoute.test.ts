import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import db from '../../config/mockDb';
import User, { IUser } from '../../models/User';
import populateDbUsers from '../../helpers/testHelpers/populateDbUsers';
import logInUser from '../../helpers/testHelpers/logInUser';

const req = request(app);
let jwtToken: string;
let payloadSub: string;
let allUsers: IUser[];

beforeAll(async () => {
  await db.connect();

  await populateDbUsers(req);

  const response = await logInUser(req);
  jwtToken = response.body.token;

  const payload = jwt.decode(jwtToken, {});
  if (payload && typeof payload.sub === 'string') {
    payloadSub = payload.sub;
  }

  allUsers = await User.find();
});

afterAll(async () => {
  await db.clear();
  await db.close();
});

describe('friends route', () => {
  // GIVEN AUTHORIZED
  describe('given authorized', () => {
    describe('/api/friends POST', () => {
      it('should return status 200 | add the friend to the currentUsers friendRequests array with status pending and userid | add the currentUsers id to the friends frindRequests array with status pending | return the updated user', async () => {
        // Send request to add friend (user 1) to friendrequest
        const res = await req
          .post('/api/friends')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ friendid: allUsers[1].id });

        // Check status code 200
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Friend request sent');

        const friend = await User.findOne({ username: '1' });
        const currentUser = await User.findOne({ username: '0' });

        if (!friend) {
          throw new Error('friend is null');
        }
        if (!currentUser) {
          throw new Error('currentUser is null');
        }

        // Check that the friendrequest is added to the friendRequests list with status pending
        expect(friend.friendRequests[0].userId).toBe(currentUser.id);
        expect(friend.friendRequests[0].status).toBe('pending');

        // Check that the friends friendRequests array is updated with a pending request from current user
        expect(currentUser.friendRequests[0].userId).toBe(friend.id);
        expect(currentUser.friendRequests[0].status).toBe('pending');
      });
    });

    describe('/api/friends GET', () => {
      it('should return status 200 and a list of the logged in users friends', async () => {
        const res = await req
          .get('/api/friends')
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(res.status).toBe(200);
      });
    });

    describe('/api/friends/:userid DELETE', () => {
      it('should return status 200 and delete the specified friend and return the updated user', async () => {
        // TODO
      });
    });

    // GIVEN UNAUTORIZED
    describe('given unauthorized', () => {
      describe('/api/friends POST', () => {
        it('should return status 401', async () => {
          const friendid = allUsers[1].id;

          const res = await req.post('/api/friends').send(friendid);

          expect(res.status).toBe(401);
        });
      });

      describe('/api/friends GET', () => {
        it('should return status 401', async () => {
          const res = await req.get('/api/friends');

          expect(res.status).toBe(401);
        });
      });

      describe('/api/friends/:userid DELETE', () => {
        it('should return status 401', async () => {
          const friendid = allUsers[1].id;

          const res = await req.post(`/api/friends/${friendid}`).send(friendid);

          expect(res.status).toBe(401);
        });
      });
    });
  });
});
