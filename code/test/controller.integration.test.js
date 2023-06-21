import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import { categories, transactions } from '../models/model.js';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// jest.mock('../models/model');

dotenv.config();

const adminRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODYxNzAwMDMsImV4cCI6MTcxNzcwNjAwM30.EsKaF8nUE5prPCUQ05LJvDp6K7iBaeZDvpKQ5Qq4bqw'
const userRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg2MTcwMTEwLCJleHAiOjE3MTc3MDYxMTB9.s1d1nvaq9oIKJRv33ue1iCMw2EwG7HXIZP18HeUl3fU'
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
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg2MTcwMTEwLCJleHAiOjE3MTc3MDYxMTB9.s1d1nvaq9oIKJRv33ue1iCMw2EwG7HXIZP18HeUl3fU',
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
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODYxNzAwMDMsImV4cCI6MTcxNzcwNjAwM30.EsKaF8nUE5prPCUQ05LJvDp6K7iBaeZDvpKQ5Qq4bqw',
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
        expect(response.body.error).toEqual("Missing attributes in the body")

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
        expect(response.body.error).toEqual("Missing attributes in the body")

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

    test('Missing category parameter', async () => {
        const body = {
            type: 'bills',
            color: 'orange'
        }

        const response = await request(app)
            .patch('/api/categories/ ')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(404);

    });

})


describe("deleteCategory", () => {
    beforeEach(async () => { await resetDb() })

    test('Category is deleted successfully', async () => {
        const body = {
            types: ['bills']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(3)

    });

    test('List of Categories is deleted successfully', async () => {
        const body = {
            types: ['bills', 'rent']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(5)

    });

    test('All categories deleted (the oldest not, transactions are updated with it)', async () => {
        const body = {
            types: ['bills', 'rent', 'entertainment']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Categories deleted")
        expect(response.body.data.count).toEqual(2)

    });

    test('Body does not contain all attributes', async () => {
        const body = {
            // types: ['bills', 'rent', 'entertainment']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes in the body")

    });

    test('Try to delete the last category', async () => {
        const body = {
            types: ['bills']
        }

        // Particular case, need to be only one type
        await categories.deleteMany({})
        const type = new categories({ type: 'bills', color: 'white' })
        await type.save()

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("There is only one category")

    });

    test('At least one type empty', async () => {
        const body = {
            types: ['', 'rent', 'entertainment']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("There is an empty string in the category list")

    });

    test('One type not exists', async () => {
        const body = {
            types: ['bills', 'transports', 'entertainment']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("You inserted an invalid category")

    });

    test('You are not an adimn', async () => {
        const body = {
            types: ['bills', 'entertainment']
        }

        const response = await request(app)
            .delete('/api/categories')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")

    });

})

describe("getCategories", () => {
    beforeEach(async () => { await resetDb() })
    test('A list of all categories returns', async () => {

        const response = await request(app)
            .get('/api/categories')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([{ type: "bills", color: "orange" }, { type: "rent", color: "yellow" }, { type: "entertainment", color: "green" }]))

    });

    test('User not authenticated', async () => {

        const response = await request(app)
            .get('/api/categories')
            .set("Cookie", `accessToken=; refreshToken=`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Unauthorized: please add your token in the headers")

    });
})

describe("createTransaction", () => {
    beforeEach(async () => { await resetDb() })

    test('Transaction created successfully', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.objectContaining(body))
    });

    test('Body does not contain all attributes', async () => {
        const body = {
            "username": "user1",
            // "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Body does not contains all requested attributes")
    });

    test('A param is an empty string (username)', async () => {
        const body = {
            "username": "",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Empty string: username")
    });

    test('A param is an empty string (amount)', async () => {
        const body = {
            "username": "user1",
            "amount": '',
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing value: amount")
    });

    test('A param is an empty string (type)', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": ""
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Empty string: type")
    });

    test('Category is not found', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": "transports"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category Not Found in the Database")
    });

    test('Username in body and username in route are different', async () => {
        const body = {
            "username": "user2",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User in parameters and User in body are different")
    });

    test('Username in body does not exist', async () => {
        const body = {
            "username": "user5",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User given in body not found in the database")
    });

    test('Username in route does not exist', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user5/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User given as route request parameter not found")
    });

    test('Amount is not a number', async () => {
        const body = {
            "username": "user1",
            "amount": '50a',
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Invalid format of amount")
    });

    test('Different user', async () => {
        const body = {
            "username": "user2",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user2/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Tokens have a different username from the requested one")
    });

    test('Added by admin on a user', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual('Tokens have a different username from the requested one')
    });

    test('Username parameter is empty string', async () => {
        const body = {
            "username": "user1",
            "amount": 50,
            "type": "bills"
        }

        const response = await request(app)
            .post('/api/users/ /transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(404);
        expect(response.body.error).toEqual("Service Not Found. Reason: Empty string: param-username")
    });
})

describe("getAllTransactions", () => {
    beforeEach(async () => { await resetDb() })
    test('Return the list of transactions of all users', async () => {

        const response = await request(app)
            .get('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 }),
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User try to get all transactions', async () => {

        const response = await request(app)
            .get('/api/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    });
})

describe("getTransactionsByUser", () => {
    beforeEach(async () => { await resetDb() })
    test('User tries to get all their transactions', async () => {

        const response = await request(app)
            .get('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by date', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date('2023-06-01T00:00:00.000Z') })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?date=2023-06-01')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))

    });

    test('User tries to get all their transactions filtered by date (from)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date(2001, 9, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?from=2023-05-01')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by date (upTo)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date(2050, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?upTo=2040-08-03')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by date (from & upTo)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date('2023-06-03T00:00:00.000Z') })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?from=2023-06-01&upTo=2023-06-03')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('Filters (on date) do not match any transaction', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date(2023, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?from=2025-06-01&upTo=2025-06-03')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([])
    
    });

    test('User tries to get all their transactions filtered by amount', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 600, date: new Date(2023, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?amount=500')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 600 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by amount (min)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 600, date: new Date(2023, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?min=500')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 600 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by amount (max)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 600, date: new Date(2023, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?max=200')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 600 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User tries to get all their transactions filtered by amount (min & max)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 500, date: new Date(2023, 5, 1, 0, 0, 0) })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?min=0&max=200')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 500 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
        
    });

    test('User tries to get all their transactions filtered by amount (min & max) and by date (from & upTo)', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 700, date: new Date('2023-06-02T00:00:00.000Z') })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?min=600&max=800&from=2023-06-01&upTo=2023-06-02')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 700 }),
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
        
    });

    test('User tries to get all their transactions filtered by amount and by date', async () => {

        const newTransaction = new transactions({ username: 'user1', type: 'bills', amount: 700, date: new Date('2023-06-01T00:00:00.000Z') })
        await newTransaction.save()

        const response = await request(app)
            .get('/api/users/user1/transactions?date=2023-06-01&amount=700')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 700 }),
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('User passed as parameter is not memorized in DB', async () => {

        const response = await request(app)
            .get('/api/users/user5/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User not found")
    });

    test('User authenticated and the request one are different', async () => {

        const response = await request(app)
            .get('/api/users/user3/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Tokens have a different username from the requested one")
    });

    // /api/transactions/users/:username
    test('User tries to use admin api', async () => {

        const response = await request(app)
            .get('/api/transactions/users/user1')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    });

    test('Admin gets transactions of a User', async () => {

        const response = await request(app)
            .get('/api/transactions/users/user1')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('Username parameter is missing', async () => {

        const response = await request(app)
            .get('/api/users/ /transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(404);
        expect(response.body.error).toEqual("Service Not Found. Reason: Empty string: username")
    });

})

describe("getTransactionsByUserByCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('User gets all their transactions filtered by category', async () => {

        const response = await request(app)
            .get('/api/users/user1/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
    });

    test('Category not exists', async () => {

        const response = await request(app)
            .get('/api/users/user1/transactions/category/transports')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category not found")
    });

    test('User passed as parameter not exists', async () => {

        const response = await request(app)
            .get('/api/users/user5/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User not found")
    });

    test('User authenticated and the requested one are different', async () => {

        const response = await request(app)
            .get('/api/users/user3/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Tokens have a different username from the requested one")
    });

    // /api/transactions/users/:user/category/:type
    test('User tries to use admin api', async () => {

        const response = await request(app)
            .get('/api/transactions/users/user1/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    });

    test('Admin gets transactions of user filtered by category', async () => {

        const response = await request(app)
            .get('/api/transactions/users/user1/category/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 }),
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
    });
})

describe("getTransactionsByGroup", () => {
    beforeEach(async () => { await resetDb() })
    test('User gets transactions of their own group', async () => {

        const response = await request(app)
            .get('/api/groups/group1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 }),
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });

    test('Group does not exist', async () => {

        const response = await request(app)
            .get('/api/groups/group3/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual('Group not found')
    });

    test('User not in this group', async () => {

        const response = await request(app)
            .get('/api/groups/group2/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual('Your email is not in the group')
    });

    // /api/transactions/groups/:name
    test('User tries to use admin api', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/group1')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual('You are not an Admin')
    });

    test('Admin gets transactions of a group', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/group1')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 }),
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 })
        ]))
    });
})

describe("getTransactionsByGroupByCategory", () => {
    beforeEach(async () => { await resetDb() })
    test('User gets transactions of their own group filtered by category', async () => {

        const response = await request(app)
            .get('/api/groups/group1/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
    });

    test('Category not exists', async () => {

        const response = await request(app)
            .get('/api/groups/group1/transactions/category/transports')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Category not found")
    });

    test('Group not exists', async () => {

        const response = await request(app)
            .get('/api/groups/group3/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Group not found")
    });

    test('User is not in the group', async () => {

        const response = await request(app)
            .get('/api/groups/group2/transactions/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Your email is not in the group")
    });

    // /api/transactions/groups/:name/category/:category
    test('User tries to use admin api', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/group1/category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    });

    test('Admin gets group transactions filtered by category', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/group1/category/bills')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 200 }),
            expect.objectContaining({ username: 'user1', type: 'bills', amount: 100 }),
            expect.objectContaining({ username: 'user2', type: 'bills', amount: 50 })
        ]))
        expect(response.body.data).toEqual(expect.not.arrayContaining([
            expect.objectContaining({ username: 'user3', type: 'rent', amount: 300 }),
            expect.objectContaining({ username: 'user1', type: 'rent', amount: 500 })
        ]))
    });

    test('Group parameter is missing', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/ /category/bills')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(404);
        expect(response.body.error).toEqual("Service Not Found. Reason: Empty string: name")
    });

    test('Group parameter is missing', async () => {

        const response = await request(app)
            .get('/api/transactions/groups/group1/category/ ')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

        expect(response.status).toBe(404);
    });
})

describe("deleteTransaction", () => {
    beforeEach(async () => { await resetDb() })
    test('User delete one of their transactions', async () => {
        const newTransaction = new transactions({_id: '000ddc0d00a0a00b0c00a000', username: 'user1', type: 'rent', amount: 800})
        await newTransaction.save()

        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Transaction deleted")
    });

    test('Missing id in req body', async () => {
        const newTransaction = new transactions({_id: '000ddc0d00a0a00b0c00a000', username: 'user1', type: 'rent', amount: 800})
        await newTransaction.save()

        const body = {
            // _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing id")
    });

    test('User not found', async () => {
        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user5/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User not found")
    });

    test('Transaction not exists', async () => {
        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Transaction not found")
    });

    test('Transaction of another user', async () => {
        const newTransaction = new transactions({_id: '000ddc0d00a0a00b0c00a000', username: 'user2', type: 'rent', amount: 800})
        await newTransaction.save()

        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Not authorized: transaction of another user")
    });

    test('User authenticated and requested are different', async () => {
        const newTransaction = new transactions({_id: '000ddc0d00a0a00b0c00a000', username: 'user2', type: 'rent', amount: 800})
        await newTransaction.save()

        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/user2/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Tokens have a different username from the requested one")
    });

    test('Id format invalid', async () => {
        const body = {
            _id: '000ddc0d00a0a00b0c0'
        }

        const response = await request(app)
            .delete('/api/users/user1/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Invalid ID")
    });

    test('Username parameter is missing', async () => {
        const body = {
            _id: '000ddc0d00a0a00b0c00a000'
        }

        const response = await request(app)
            .delete('/api/users/ /transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(404);
        expect(response.body.error).toEqual("Service Not Found. Reason: Empty string: username")
    });

})

describe("deleteTransactions", () => {
    beforeEach(async () => { await resetDb() })
    test('Admin deletes transactions', async () => {
        const newTransaction = new transactions({_id: '000ddc0d00a0a00b0c00a000', username: 'user2', type: 'rent', amount: 800})
        await newTransaction.save()
        const newTransaction2 = new transactions({_id: '000ddc0d00a0a00b0c00a001', username: 'user1', type: 'bills', amount: 800})
        await newTransaction2.save()

        const body = {
            _ids: ['000ddc0d00a0a00b0c00a000', '000ddc0d00a0a00b0c00a001']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("Transactions deleted")
    });

    test('At least one id is empty', async () => {
        const body = {
            _ids: ['', '000ddc0d00a0a00b0c00a001']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("You inserted an empty string as Id")
    });

    test('Missing ids in body', async () => {
        const body = {
            // _ids: ['', '000ddc0d00a0a00b0c00a001']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing ids")
    });

    test('At least one transaction does not exist', async () => {
        const body = {
             _ids: ['000ddc0d00a0a00b0c00a001']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("One or more Transactions not found")
    });

    test('Not admin', async () => {
        const body = {
             _ids: ['000ddc0d00a0a00b0c00a001']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
            .send(body)

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("You are not an Admin")
    });

    test('Id not valid', async () => {
        const body = {
             _ids: ['000ddc0d00a0a00b0c00']
        }

        const response = await request(app)
            .delete('/api/transactions')
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send(body)

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Invalid ID")
    });
})
