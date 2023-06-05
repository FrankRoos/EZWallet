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

    test('One type not exists', async () => {
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
        expect(response.body.data).toEqual(expect.arrayContaining([ {type: "bills", color: "orange"}, {type: "rent", color: "yellow"}, {type: "entertainment", color: "green"} ]))
    
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
