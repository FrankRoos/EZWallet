import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';


/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();

const adminRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY'
const userRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODk0ODg2LCJleHAiOjE3MTc0NTI0ODZ9.sDleB1--yGiMR3CFk26YxNgQ_gG36UJVjPEoYyDlKa8'
const adminAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0'
const userAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8'


/*
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

    await Promise..all([user1.save(), user2.save(), user3.save(), admin.save(), transaction1.save(), transaction2.save(), transaction3.save(),
    transaction4.save(), transaction5.save(), group1.save(), group2.save(), category1.save(), category2.save(), category3.save()])*/
const resetDb = async () => {
    await User.deleteMany({})
    await categories.deleteMany({})
    await Group.deleteMany({})
    await transactions.deleteMany({})
}


beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => { await resetDb() })

  test("a 401 error if called by an authenticated user who is not an admin (authType = Admin)", (done) => {
    User.create({
      username: 'user1',
      email: 'user1@gmail.com',
      password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
      role: 'Regular',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODk0ODg2LCJleHAiOjE3MTc0NTI0ODZ9.sDleB1--yGiMR3CFk26YxNgQ_gG36UJVjPEoYyDlKa8',
    }).then(() => {
      request(app)
        .get("/api/users")
        .set('Cookie', `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body.error).toEqual("You are not an Admin")
          done()
        })
        .catch((err) => done(err))
      })
  })

  test("should return empty list if there are no users apart from the admin", (done) => {
    User.create({
        username: 'admin',
        email: 'adm@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Admin',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY',
    }).then(() => {
      request(app)
        .get("/api/users")
        .set('Cookie', `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body.data).toHaveLength(0)
          done()
        })
        .catch((err) => done(err))
    })
  })
 
  test("should retrieve list of all users", (done) => {
      const user1 = new User({
      username: 'user1',
      email: 'user1@gmail.com',
      password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
      role: 'Regular',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODk0ODg2LCJleHAiOjE3MTc0NTI0ODZ9.sDleB1--yGiMR3CFk26YxNgQ_gG36UJVjPEoYyDlKa8',
      })
      Promise.resolve(user1.save())
      User.create({
        username: 'admin',
        email: 'adm@gmail.com',
        password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
        role: 'Admin',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY',
      }).then(() => {
        request(app)
          .get("/api/users")
          .set('Cookie', `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
          .then((response) => {
            expect(response.status).toBe(200)
            expect(response.body.data[1].username).toEqual('admin')
            expect(response.body.data[1].email).toEqual('adm@gmail.com')
            expect(response.body.data[1].role).toEqual('Admin')
            expect(response.body.data[0].username).toEqual("user1")
            expect(response.body.data[0].email).toEqual('user1@gmail.com')
            expect(response.body.data[0].role).toEqual('Regular')
            done()
          })
          .catch((err) => done(err))
      })
  })

})

describe("getUser", () => { test("should retrieve list of all users", (done) =>{done()} ) }) 

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
