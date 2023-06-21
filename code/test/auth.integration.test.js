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
  test('returns error 400 when any parameter is missing', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'ciao@gmail.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any parameter is missing2', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ username:"asdfasdf",password:"asdfasdfasdf" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any parameter is empty', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'ciao@gmail.com', username: 'ciaociao', password: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 when any parameter is empty', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'ciao@gmail.com', username: '', password: '3454421ddd' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 when any parameter is empty', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: '', username: 'ciaociao', password: 'rfgtyhyy' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });

  test('returns error 400 the email format is not correct', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'ciao', username: 'ciaociao', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Email format is not correct' });
  });
  test('returns error 400 when the username is already taken', async () => {

    await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
    });
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'test200@example.com', username: 'test', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Username already taken' });
  });
  /*test('returns error 400 when the password lenght is < 8', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({ email: 'ciao@example.com', username: 'ciaociao', password: 'passw' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Password doesn't match constraints,requires at least 8 characters" });
  });*/
 

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
  test('returns 400 error when any parameter is missing', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'ciao@gmail.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any parameter is missing2', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ username:"asdfasdf",password:"asdfasdfasdf" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any  1 parameter is empty', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'ciao@gmail.com', username: 'ciaociao', password: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 when any 2 parameter is empty', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'ciao@gmail.com', username: '', password: '3454421ddd' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 when any 3 parameter is empty', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: '', username: 'ciaociao', password: 'rfgtyhyy' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });

  test('returns error 400 the email format is not correct', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'ciao', username: 'ciaociao', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Email format is not correct' });
  });
  test('returns error 400 when the username is already taken', async () => {

    await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
    });
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'test200@example.com', username: 'test', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Username already taken' });
  });
  /*test('returns error 400 when the password lenght is < 8', async () => {
    const response = await request(app)
      .post('/api/admin')
      .send({ email: 'ciao@example.com', username: 'ciaociao', password: 'passw' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Password doesn't match constraints,requires at least 8 characters" });
  });*/
 
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
  test('returns 400 error when any parameter is missing', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'ciao@gmail.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any parameter is missing2', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ password:"asdfasdfasdf" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing Parameters' });
  });
  test('returns error 400 when any 1 parameter is empty', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'ciao@gmail.com', password: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 when any 2 parameter is empty', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'ciao@gmail.com', password: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'A parameter is empty' });
  });
  test('returns error 400 the email format is not correct', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'ciao', username: 'ciaociao', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Email format is not correct' });
  });
  test('returns error 400 the email does not exists', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'ciao@gmail.com', username: 'ciaociao', password: 'testtesttest' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'please you need to register' });
  })
  test('returns 400 error when the password is incorrect', async () => {
    await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
    });
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'wrong password' });
  });
  

  

});

describe('logout', () => {
  beforeEach(async () => {
    await User.deleteMany();
  })
  test('Should return status 200 OK on successful logout', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role: 'Regular',
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role: 'Regular',
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );

    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      refreshToken: refreshToken,
      accessToken: accessToken,
    });

    const response = await request(app)
      .get('/api/logout')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`);



    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('User logged out');
  });
  
  test('returns error 400 when refresh token is missing in cookies', async () => {
    const response = await request(app)
      .get('/api/logout')
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing refresh token in cookies' });
  });
  test('returns error 400 when user is not found', async () => {
    
    const cookies = { refreshToken: 'token_not_valid' };
  
    const response = await request(app)
      .get('/api/logout')
      .set('Cookie', `refreshToken=${cookies.refreshToken}`)
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'user not found' });
  });
  test('returns error 401 when verifyAuth returns false', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  
    const response = await request(app)
      .get('/api/logout')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`);
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token is missing information' });
  }); 
  

});
