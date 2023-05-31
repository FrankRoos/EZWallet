import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import * as auth from '../controllers/auth.js';
import * as utils from '../controllers/utils.js';
const bcrypt = require("bcryptjs")
import { verifyAuth } from '../controllers/utils.js';

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => {
  test('Dummy test, change it', () => {
    expect(true).toBe(true);
  });
});

describe("registerAdmin", () => {
  test('Dummy test, change it', () => {
    expect(true).toBe(true);
  });
})

describe('login', () => {
  test('Simple login', async () => {
    const existingUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    const mockReq = {
      body: {
        email: "angelo.iannielli99@gmail.com",
        password: "12345678"
      },
      /*cookie: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      }*/
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    /*const verify = jest.fn(()=> {return true});
    utils.verifyAuth = verify;*/

    jest.spyOn(jwt, "sign").mockImplementation(() => { return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8" })
    jest.spyOn(bcrypt, "compare").mockImplementation(() => { return true })
    jest.spyOn(User, "findOne").mockImplementation(() => { return existingUser })
    // jest.spyOn(existingUser, "save").mockImplementation(() => {  })
    await auth.login(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('Returns a error 400 if some req.body is absent', async () => {
    const mockReq = {
      body: {
        email: 'ciao@gmail.com'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await auth.login(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing Parameters' });
    
  });
  test('email empty', async () => {
    const mockReq = {
      body: {
        email: '',
        password: "asdfasdfasdf"
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await auth.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Email empty" });
  });
  test('password empty', async () => {
    const mockReq = {
      body: {
        email: 'dddddd@gmail.com',
        password: ''
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await auth.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Password empty" });
  });
  test('Incorrect email format', async () => {
    const mockReq = {
      body: {
        email: 'ccrcrrcrc',
        password: '33dec4c4c4'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await auth.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email format is not correct' });
  });
  test('Supplied password does not match with the one in the database', async () => {
    const existingUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    const mockReq = {
      body: {
        email: 'existentemail@gmail.com',
        password: 'wrongpassword'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await auth.login(mockReq, mockRes);

    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.body.password, existingUser.password);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'wrong password' });
  });
  test('Email does not identify a user in the database', async () => {
    const mockReq = {
      body: {
        email: 'nonexistent-email@gmail.com',
        password: 'password123'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    await auth.login(mockReq, mockRes);
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'please you need to register' });
  });
  test('Return 400 of the catch', async () => {
    const existingUser = {
      email: 'test@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser',
      save: jest.fn().mockResolvedValue({ refreshToken: 'refreshToken' }),
    };
    const mockReq = {
      body: {
        email: 'existentemail@gmail.com',
        password: 'password123',
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);
    jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('Password comparison failed'));

    await auth.login(mockReq, mockRes);

    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.body.password, existingUser.password);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Password comparison failed' });
  });
});

describe('logout', () => {
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    //additional `mockClear()` must be placed here
  });
  test("Simple logout", async () => {
    const mockReq = {
      cookies: {
        refreshToken: 'validrefreshToken'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    const user = {
      refreshToken: 'validRefreshToken',
      save: jest.fn().mockResolvedValue({}),
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(user);

    const verifyAuthMock = jest.fn(() => ({ flag: true }));
    utils.verifyAuth = verifyAuthMock;


    await auth.logout(mockReq, mockRes);

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: 'User logged out' } });
  });

  test("RefreshToken not in the body=> Error 400", async () => {
    const mockReq = {
      cookies: {} 
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.spyOn(User, "findOne").mockImplementation(() => {
      throw new Error("User.findOne should not be called");
    });
  
    await auth.logout(mockReq, mockRes);
  
    expect(User.findOne).not.toHaveBeenCalled(); 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing refresh token in cookies" });
  });
  test("User not found=> Error 400", async () => {
    const mockReq = {
      cookies: {
        refreshToken: 'validrefreshToken'
      } 
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
  
    await auth.logout(mockReq, mockRes);
    expect(User.findOne).toHaveBeenCalledWith({refreshToken: mockReq.cookies.refreshToken});
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
  });
  test("Error 401 on verifyAuth", async () => {

    const mockReq = {
      cookies: {
        refreshToken: "validRefreshToken"
    }
      }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    const user = {
      refreshToken: 'validRefreshToken',
      save: jest.fn().mockResolvedValue({}),
    };
    const verify = jest.fn(() => ({ flag: false, cause: "Some error message" }));
  utils.verifyAuth = verify;

  jest.spyOn(User, "findOne").mockResolvedValue(user);

  await auth.logout(mockReq, mockRes);

  expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
  expect(verify).toHaveBeenCalledWith(mockReq, mockRes, { token: user.refreshToken });
  expect(mockRes.status).toHaveBeenCalledWith(401);
  expect(mockRes.json).toHaveBeenCalledWith({ error: "Some error message" });
  });
  test("Return 400 of the catch", async () => {
    const mockReq = {
      cookies: {
        refreshToken: "validRefreshToken"
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const error = new Error("Some error message");
    jest.spyOn(User, "findOne").mockRejectedValue(error);
  
    await auth.logout(mockReq, mockRes);
  
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Some error message" });
  });

});

