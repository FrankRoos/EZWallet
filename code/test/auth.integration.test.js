import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('register', () => {
  beforeEach(async () => {
    await User.deleteMany();
  })
  test('Should return status 200 OK on successful registration', async () => {
    const requestBody = {
      username: 'test',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/register')
      .send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { message: 'User added succesfully' } });
    const user = await User.findOne({ email: requestBody.email });
    expect(user).toBeDefined();
    expect(user.username).toBe(requestBody.username);
    expect(user.email).toBe(requestBody.email);

  });
})


describe("registerAdmin", () => {
  beforeEach(async () => {
    await User.deleteMany();
  })
  test('Should return status 200 OK on successful registration', async () => {
    const requestBody = {
      username: 'test',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/admin')
      .send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { message: 'Admin added succesfully' } });
    const user = await User.findOne({ email: requestBody.email });
    expect(user).toBeDefined();
    expect(user.username).toBe(requestBody.username);
    expect(user.email).toBe(requestBody.email);

  });
})

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany();
  })
  test('Should return status 200 OK on successful login', async () => {
    await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
    });

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    const updatedUser = await User.findOne({ email: 'test@example.com' });
    expect(updatedUser.refreshToken).toEqual(response.body.data.refreshToken);
  });

});

describe('logout', () => {
  beforeEach(async () => {
    await User.deleteMany();
  })
  test.skip('Should return status 200 OK on successful logout', async () => {
  const refreshToken = jwt.sign(
    {
      email: 'test@example.com',
      id: 'user-id',
      username: 'test',
      role: 'Regular',
    },
    process.env.ACCESS_KEY,
    { expiresIn: '7d' }
  );

  const accessToken = jwt.sign(
    {
      email: 'test@example.com',
      id: 'user-id',
      username: 'test',
      role: 'Regular',
    },
    process.env.ACCESS_KEY,
    { expiresIn: '1h' }
  );

  // Create a user with the assigned refresh token and access token
  const user = await User.create({
    username: 'test',
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 12),
    refreshToken: refreshToken,
    accessToken: accessToken,
  });

  const response = await request(app)
    .get('/api/logout')
    .set('Cookie', `refreshToken=${refreshToken}`)
    .set('Authorization', `Bearer ${accessToken}`); // Include the access token in the headers

  console.log('Response Status:', response.status);
  console.log('Response Body:', response.body);

  expect(response.status).toBe(200);
  expect(response.body.data.message).toBe('User logged out');
});

});
