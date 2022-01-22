import { connection } from 'mongoose';
import request from 'supertest';

import app from '../src/app';
import { Product, User } from '../src/models';
import { testAdminUser, testProduct, testUser, testUser2 } from './config-test';
import { server } from '../src/server';

const api: request.SuperTest<request.Test> = request(app);

const _testUser = testUser;
const _testAdminUser = testAdminUser;
const _testProduct = testProduct;

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
  await Product.findByIdAndRemove(_testProduct._id);

  connection.close();
  server.close();
});

describe('\n[ PRODUCT ]: Product Test Suite', () => {
  describe('a) When all data is sent', () => {
    test('1. should return 201 when registering a New Product', async () => {
      const resultRegistration = await api
        .post('/product')
        .set('Authorization', `${_testUser.token}`)
        .send(_testProduct)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      // console.log({ result: resultRegistration.body.product._id });
      _testProduct._id = resultRegistration.body.product._id;
    });
    test('2. Should return a product by id.', async () => {
      const resGetProductByID = await api
        .get(`/product/${_testProduct._id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // console.log(resGetProductByID.body.product.name);
      expect(resGetProductByID.body.product.name).toBe(
        _testProduct.name.toLowerCase()
      );
    }, 3000);
  });
});
