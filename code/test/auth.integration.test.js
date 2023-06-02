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
  beforeEach(async()=>{
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
