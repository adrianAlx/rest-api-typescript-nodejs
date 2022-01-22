import { connection } from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import { Category, User } from '../src/models';
import {
  testAdminUser,
  testCategory,
  testUser,
  testUser2,
} from './config-test';
import { server } from '../src/server';

const api: request.SuperTest<request.Test> = request(app);

const _testUser = testUser;
const _testAdminUser = testAdminUser;
const _testCategory = testCategory;

// Create a test user
beforeEach(async () => {
  await api.post('/auth/signup').send(testUser);

  const resLogin = await api.post('/auth/login').send(testUser);
  const { token } = resLogin.body;
  _testUser.token = token;

  // Admin:
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
  await User.findOneAndRemove({ email: testUser2.email });
  await User.findOneAndRemove({ email: testUser.email });
  await User.findOneAndRemove({ email: _testAdminUser.email });
  await Category.findByIdAndRemove(_testCategory._id);

  connection.close();
  server.close();
});

describe('\n[ CATEGORY ]: Category Test Suite', () => {
  describe('a) When all data is sent', () => {
    test('1. should return 201 when registering a New Category', async () => {
      const resultRegistration = await api
        .post('/category')
        .set('Authorization', `${_testUser.token}`)
        .send(_testCategory)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      _testCategory._id = resultRegistration.body.newCategory._id;
    });
    test('2. Should return a category by id.', async () => {
      const resGetUserByID = await api
        .get(`/category/${_testCategory._id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(resGetUserByID.body.category.name).toBe(
        _testCategory.name.toUpperCase()
      );
    }, 3000);
  });
});
