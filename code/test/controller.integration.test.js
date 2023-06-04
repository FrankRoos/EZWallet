import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import { categories, transactions } from '../models/model.js';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// jest.mock('../models/model');

dotenv.config();

const adminRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY'
const userRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODk0ODg2LCJleHAiOjE3MTc0NTI0ODZ9.sDleB1--yGiMR3CFk26YxNgQ_gG36UJVjPEoYyDlKa8'
const adminAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0'
const userAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8'

const resetDb = async () => {
    await User.deleteMany({})
    await categories.deleteMany({})
    await Group.deleteMany({})
    await transactions.deleteMany({})

    const user1 = new User({
        username: 'user1',
        email: 'user1@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Regular',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODk0ODg2LCJleHAiOjE3MTc0NTI0ODZ9.sDleB1--yGiMR3CFk26YxNgQ_gG36UJVjPEoYyDlKa8',
    })

    const user2 = new User({
        username: 'user2',
        email: 'user2@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Regular',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
    })

    const user3 = new User({
        username: 'user3',
        email: 'user3@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Regular',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
    })

    const admin = new User({
        username: 'admin',
        email: 'adm@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Admin',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY',
    })

    const transaction1 = new transactions({
        username: 'user1',
        type: 'bills',
        amount: 200
    })

    const transaction2 = new transactions({
        username: 'user1',
        type: 'bills',
        amount: 100
    })

    const transaction3 = new transactions({
        username: 'user1',
        type: 'rent',
        amount: 500
    })

    const transaction4 = new transactions({
        username: 'user2',
        type: 'bills',
        amount: 50
    })

    const transaction5 = new transactions({
        username: 'user3',
        type: 'rent',
        amount: 300
    })

    const category1 = new categories({
        type: 'bills',
        color: 'orange'
    })

    const category2 = new categories({
        type: 'rent',
        color: 'yellow'
    })

    const category3 = new categories({
        type: 'entertainment',
        color: 'green'
    })

    const group1 = new Group({
        name: 'group1',
        members: [{ email: user1.email }, { email: user2.email }]
    })

    const group2 = new Group({
        name: 'group2',
        members: [{ email: user3.email }]
    })

    await Promise.all([user1.save(), user2.save(), user3.save(), admin.save(), transaction1.save(), transaction2.save(), transaction3.save(),
    transaction4.save(), transaction5.save(), group1.save(), group2.save(), category1.save(), category2.save(), category3.save()])

}

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

    beforeEach(async () => { await resetDb() })
    test('Create a new category successfully', async () => {
        const body = {
            type: 'transports',
            color: 'black'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(body)
    
    });

    test('The request does not contain all attributes', async () => {
        const body = {
            // type: 'transports',
            color: 'black'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes in the body")
    
    });

    test('At least one param is an empty string (type)', async () => {
        const body = {
            type: '',
            color: 'black'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Empty string: type")
    
    });

    test('At least one param is an empty string (color)', async () => {
        const body = {
            type: 'transports',
            color: ''
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Empty string: color")
    
    });

    test('Category already exists', async () => {
        const body = {
            type: 'bills',
            color: 'white'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category type already exists")
    
    });

    test('Color already used', async () => {
        const body = {
            type: 'Transports',
            color: 'Orange'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Color already used")
    
    });

    test('Not an admin', async () => {
        const body = {
            type: 'bills',
            color: 'white'
        }

        const response = await request(app)
            .post('/api/categories')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    
    });
    
})

describe("updateCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('Category updated successfully (change type)', async () => {
        const body = {
            type: 'bill',
            color: 'orange'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(3)
    
    });

    test('Category updated successfully (change color)', async () => {
        const body = {
            type: 'bills',
            color: 'blue'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(3)
    
    });

    test('Category updated successfully (change color and type)', async () => {
        const body = {
            type: 'bill',
            color: 'blue'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Category edited successfully")
        expect(response.body.data.count).toEqual(3)
    
    });

    test('Body does not contain all attributes', async () => {
        const body = {
            // type: 'bill',
            color: 'orange'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes in the body")
    
    });

    test('At least one param is empty (type)', async () => {
        const body = {
            type: '',
            color: 'orange'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Service Not Found. Reason: Empty string: type")
    
    });

    test('At least one param is empty (color)', async () => {
        const body = {
            type: 'bills',
            color: ''
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Empty string: color")
    
    });

    test('Type parameter in route not exists', async () => {
        const body = {
            type: 'bills',
            color: 'blue'
        }

        const response = await request(app)
            .patch('/api/categories/billss')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category type does not exist in the database")
    
    });

    test('Category in body already exists', async () => {
        const body = {
            type: 'rent',
            color: 'blue'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category type in the body request already exists")
    
    });

    test('Not an admin', async () => {
        const body = {
            type: 'bills',
            color: 'white'
        }

        const response = await request(app)
            .patch('/api/categories/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    
    });

})

/*
describe("deleteCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
    
})*/

describe("getCategories", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => {
    beforeEach(async () => { await resetDb() })
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
