import { connection } from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import { User } from '../src/models';
import { testUser, testAdminUser, updatedUser } from './config-test';
import { server } from '../src/server';

const api: request.SuperTest<request.Test> = request(app);

const _testUser = testUser;
const _testAdminUser = testAdminUser;

// Create a test user
beforeEach(async () => {
  const newUser = await api.post('/auth/signup').send(testUser);
  _testUser._id = newUser.body.user.uid;
  // console.log('>>>> 1111', { newUser: newUser.body });

  const resLogin = await api.post('/auth/login').send(testUser);
  const { token } = resLogin.body;
  _testUser.token = token;

  // // test admin user:
  const newAdminUser = await api.post('/auth/signup').send(_testAdminUser);
  _testAdminUser._id = newAdminUser.body.user.uid;

  const resLogin2 = await api.post('/auth/login').send(_testAdminUser);
  const { token: adminToken } = resLogin2.body;

  _testAdminUser.token = adminToken;
});

afterEach(async () => {
  await User.findOneAndRemove({ email: testUser.email });
  await User.findOneAndRemove({ email: _testAdminUser.email });
});

afterAll(async () => {
  connection.close();
  server.close();
});

describe('\n[ USERS ]: User Test Suite', () => {
  describe('a) When all data is sent', () => {
    test('1. Should return a user by id.', async () => {
      // console.log('>>>>>>> 22222', { _testUser });
      await api
        .get(`/user/${_testUser._id}`)
        .set('Authorization', `${_testUser.token}`)
        .expect(200);
    });
    test('2. Should update an especific user by id.', async () => {
      const resUpdateUser = await api
        .put(`/user/${_testUser._id}`)
        .set('Authorization', `${_testUser.token}`)
        .send(updatedUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // console.log('\n\n\n>>>> 3333:\n', { resUpdateUser: resUpdateUser.body });

      expect(resUpdateUser.body.user.name).toBe(updatedUser.name);
    }, 3000);
    test('3. Should delete an especific user by id', async () => {
      const resGetUsersBefore = await api.get('/user');
      const initialActiveUsers = resGetUsersBefore.body.total;

      await api
        .delete(`/user/${_testAdminUser._id}`)
        .set('Authorization', `${_testAdminUser.token}`)
        .expect(200);

      // Total active users: Error due to Cache
      const resGetUsersAfter = await api.get('/user');
      const afterDeleted = resGetUsersAfter.body.total;

      expect(initialActiveUsers - 1).toBe(afterDeleted);
    }, 1500);
  });

  describe('b) When data are missing', () => {
    test('1. should return 401 when token is missing', async () => {
      await api.put(`/user/${_testAdminUser._id}`).expect(401);
      await api.delete(`/user/${_testAdminUser._id}`).expect(401);
    });
    test('2. should return 401 when sending an invalid role', async () => {
      await api
        .delete(`/user/${_testAdminUser._id}`)
        .set('Authorization', `${_testUser.token}`)
        .expect(401);
    });
    test('3. should return 400 when sending an invalid uid', async () => {
      await api
        .put('/user/121asdasd')
        .set('Authorization', `${_testUser.token}`)
        .expect(400);
      await api
        .delete('/user/121asdasd')
        .set('Authorization', `${_testUser.token}`)
        .expect(400);
    });
  });
});
