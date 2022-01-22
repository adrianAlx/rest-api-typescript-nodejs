'use strict';

interface TestUser {
  name: string;
  password: string;
  newPassword?: string;
  email?: string;
  role?: string;
  token?: string;
  _id?: string;
}

// Auth
export const testUser: TestUser = {
  name: 'Alex 33',
  email: 'test33@test.com',
  password: '123123',
  role: 'USER_ROLE',
};

export const testUser2: TestUser = {
  name: 'Alex 332',
  email: 'test332@test.com',
  password: '123123',
  role: 'USER_ROLE',
};
