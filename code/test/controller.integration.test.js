import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model.js';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Group, User } from "../models/User.js";

jest.mock('../models/model');

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
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

describe("createCategory", () => { 
    beforeEach(() => {
        jest.restoreAllMocks()
    });
    test("should return a 401 error if accessed without authorization", async () => {
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
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
            role: "Regular"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)

        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
    
        expect(response.status).toBe(401)
        expect(response.body).toEqual({error: "You are not an Admin"});
    })

    test('should return a 400 error if the request body does not contain all the necessary attributes', async () => {
        const new_category = {type: "food"}
        const refreshToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
          );
      
          const accessToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: refreshToken,
            role: "Admin"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)


        //jest.spyOn(categories.prototype, "save").mockImplementation(() => {return Promise.resolve(new_category)})
        const response = await request(app)
        .post('/api/categories')
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
        .send(new_category);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing attributes in the body"});
    });

    test('should return a 400 error if at least one of the parameters in the request body is an empty string', async () => {
        const new_category = {type: "food", color:""}
        const refreshToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
          );
      
          const accessToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: refreshToken,
            role: "Admin"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)


        //jest.spyOn(categories.prototype, "save").mockImplementation(() => {return Promise.resolve(new_category)})
        const response = await request(app)
        .post('/api/categories')
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
        .send(new_category);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Empty string: color"});
    });

    test('Should return a 400 error if the type of category passed in the request body represents an already existing category in the database by type search', async () => {
        const new_category = {type: "food", color:"green"}
        const refreshToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
          );
      
          const accessToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: refreshToken,
            role: "Admin"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)

        jest.spyOn(categories, "find")
        .mockReturnValueOnce(Promise.resolve([new_category]))
        .mockReturnValue(1)

        const response = await request(app)
        .post('/api/categories')
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
        .send(new_category);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Category type already exists"});
    });

    test('Should return a 400 error if the color of category passed in the request body represents an already existing category in the database by color search', async () => {
        const new_category = {type: "food", color:"green"}
        const refreshToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
          );
      
          const accessToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: refreshToken,
            role: "Admin"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)

        jest.spyOn(categories, "find")
        .mockReturnValueOnce([])
        .mockReturnValueOnce([new_category])
        .mockReturnValue(1)

        const response = await request(app)
        .post('/api/categories')
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
        .send(new_category);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Color already used"});
    });

    test('Should create a new category and return the saved data and a 200 success code', async () => {
        const new_category = {
            _id: "647888a2e87ff1b64165609d",
            type: "food",
            color: "blue",
            date: "2023-06-01T12:01:38.709Z",
          }
        const refreshToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '7d' }
          );
      
          const accessToken = jwt.sign(
            {
              email: 'test@example.com',
              username: 'test',
              role: 'Admin',
            },
            process.env.ACCESS_KEY,
            { expiresIn: '1h' }
          );
        const user = {
            username: "user",
            email: "user@admin.cm",
            password: "adminadmin",
            refreshToken: refreshToken,
            role: "Admin"
          }

        jest.spyOn(User, "findOne")
        .mockReturnValueOnce(user)
        .mockReturnValue(1)

        jest.spyOn(categories, "find")
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValue(1)

        jest.spyOn(categories.prototype, "save").mockImplementation(() => { return Promise.resolve(new_category) })

        const response = await request(app)
        .post('/api/categories')
        .set("Cookie", `accessToken=${accessToken};refreshToken=${refreshToken}`)
        .send(new_category);

        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({data: new_category});
    });
    
})

describe("updateCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
