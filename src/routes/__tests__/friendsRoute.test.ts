import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import db from '../../config/mockDb';
import User, { IUser } from '../../models/User';
import populateDbUsers from '../../helpers/testHelpers/populateDbUsers';
import logInUser from '../../helpers/testHelpers/logInUser';
import FriendRequest from '../../models/FriendRequest';

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
    describe('/api/friends GET', () => {
      it('should return status 200 and a list of the logged in users friends', async () => {
        const user = await User.findById(payloadSub);
        if (!user) {
          throw new Error('could not find user');
        }

        user.friends.push(allUsers[1].id, allUsers[2].id, allUsers[3].id);

        await user.save();

        const res = await req
          .get('/api/friends')
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(res.status).toBe(200);
        expect(res.body.friends[0].id).toBe(allUsers[1].id);
        expect(res.body.friends[1].id).toBe(allUsers[2].id);
        expect(res.body.friends[2].id).toBe(allUsers[3].id);

        // Remove friends from friends array
        user.friends = [];
        await user.save();
      });
    });

    describe('/api/friends POST', () => {
      it('should return status 200 & add a new friendrequest object to the database with status pending and currentuser as requester and friend as recipient', async () => {
        // Send request to add friend (user 1) to friendrequest
        const res = await req
          .post('/api/friends')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ friendid: allUsers[1].id });

        const currentUser = await User.findOne({ username: '0' });
        if (!currentUser) {
          throw new Error('currentUser is null');
        }

        const friend = await User.findOne({ username: '1' });
        if (!friend) {
          throw new Error('friend is null');
        }

        const friendRequests = await FriendRequest.find();
        if (!friendRequests) {
          throw new Error('friendRequests is null');
        }

        // Check status code 200
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Friend request sent');

        // Check that the friendrequest is added to the friendRequests collection with status pending
        expect(friendRequests[0].status).toBe('pending');

        // Check that requester is the id of the current user and the recipient is the id of the friend
        expect(friendRequests[0].requester.toString()).toBe(currentUser.id);
        expect(friendRequests[0].recipient.toString()).toBe(friend.id);

        // Remove friendRequest
        await FriendRequest.findByIdAndDelete(friendRequests[0].id);
      });
    });

    describe('/api/friends/ PUT', () => {
      describe('if request is accepted', () => {
        it('should return status 200 & add friendid to current users friends array and vice versa & remove the friendrequest document from the database', async () => {
          const friendRequest = new FriendRequest({
            requester: allUsers[1].id,
            recipient: payloadSub,
            status: 'pending'
          });

          await friendRequest.save();

          const res = await req
            .put('/api/friends')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ friendid: allUsers[1], accepted: 'true' });

          const currentUser = await User.findById(payloadSub);
          if (!currentUser) {
            throw new Error('currentUser is null');
          }

          const friend = await User.findById(allUsers[1].id);
          if (!friend) {
            throw new Error('friend is null');
          }

          const friendRequests = await FriendRequest.find();
          if (!friendRequests) {
            throw new Error('friendRequests is null');
          }

          expect(res.status).toBe(200);
          expect(currentUser.friends[0].toString()).toBe(allUsers[1].id);
          expect(friend.friends[0].toString()).toBe(currentUser.id);
          expect(friendRequests.length).toBe(0);

          // Remove friends
          currentUser.friends = [];
          await currentUser.save();
          friend.friends = [];
          await friend.save();
        });
      });

      describe('if request is rejected', () => {
        it('should return status 200 & update the friendRequest document status to rejected', async () => {
          // TODO
        });
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
