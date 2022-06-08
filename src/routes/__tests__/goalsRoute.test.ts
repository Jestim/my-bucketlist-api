import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import db from '../../config/mockDb';
import Goal, { IGoal } from '../../models/Goal';
import populateDbUsers from '../../helpers/testHelpers/populateDbUsers';
import logInUser from '../../helpers/testHelpers/logInUser';

const req = request(app);
let jwtToken: string;
let payloadSub: string;
const testGoalTitle = 'Test goal';
const testGoalUpdatedTitle = 'Test goal updated';
let testGoalId: string;

beforeAll(async () => {
  await db.connect();

  await populateDbUsers(req);

  const response = await logInUser(req);
  jwtToken = response.body.token;

  const payload = jwt.decode(jwtToken, {});
  if (payload && typeof payload.sub === 'string') {
    payloadSub = payload.sub;
  }

  const res = await req
    .post('/api/goals')
    .send({
      title: testGoalTitle
    })
    .set('Authorization', `Bearer ${jwtToken}`);

  testGoalId = res.body.goal.id;
});

afterAll(async () => {
  await db.clear();
  await db.close();
});

describe('goals route', () => {
  describe('given authorized', () => {
    describe('/api/goals POST - with updated info in body', () => {
      it('should return status 200, sucess message and the goal with the logged in user as the creator', async () => {
        const res = await req
          .post('/api/goals')
          .send({
            title: 'New goal'
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('New goal created');
        expect(res.body.goal.title).toBe('New goal');
        expect(res.body.goal.creator).toBe(payloadSub);
      });
    });

    describe('/api/goals/:goal PUT - with updated info in body', () => {
      it('should return status 200, sucess message and the updated goal with creator mathing the authenticated user', async () => {
        const res = await req
          .put(`/api/goals/${testGoalId}`)
          .send({
            title: testGoalUpdatedTitle
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Goal updated');
        expect(res.body.goal.id).toBe(testGoalId);
        expect(res.body.goal.title).toBe(testGoalUpdatedTitle);
        expect(res.body.goal.creator).toBe(payloadSub);
      });
    });

    describe('/api/goals/:goal DELETE', () => {
      it('should return status 200, sucess message and the deleted goal with creator mathing the authenticated user', async () => {
        const res = await req
          .delete(`/api/goals/${testGoalId}`)
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Goal deleted');
        expect(res.body.goal.id).toBe(testGoalId);
        expect(res.body.goal.creator).toBe(payloadSub);
      });
    });
  });

  describe('given unauthorized', () => {
    describe('/api/goals POST - with updated info in body', () => {
      it('should return status 401', async () => {
        const res = await req.post('/api/goals').send({
          title: 'New goal'
        });

        expect(res.status).toBe(401);
      });
    });

    describe('/api/goals/:goal PUT - with updated info in body', () => {
      it('should return status 401', async () => {
        const res = await req.put(`/api/goals/${testGoalId}`).send({
          title: testGoalUpdatedTitle
        });

        expect(res.status).toBe(401);
      });
    });

    describe('/api/goals/:goal DELETE', () => {
      it('should return status 401', async () => {
        const res = await req.delete(`/api/goals/${testGoalId}`);

        expect(res.status).toBe(401);
      });
    });
  });
});
