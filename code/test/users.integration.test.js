import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
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
  const dbName = "testingDatabaseUsers";
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

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => { await resetDb() })

  test("should return error 401 if  called by an authenticated user who is not an admin", async () => {

  
    const response = await request(app)
    .get('/api/users')
    .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
   

 
    
  
    
    expect(response.status).toBe(401)
  

  })


  

  test("should return empty list if there are no users", async () => {


    await  User.deleteMany({})

    const admin = new User({
      username: 'admin',
      email: 'adm@gmail.com',
      password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
      role: 'Admin',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODYxNzAwMDMsImV4cCI6MTcxNzcwNjAwM30.EsKaF8nUE5prPCUQ05LJvDp6K7iBaeZDvpKQ5Qq4bqw',
  })
  await admin.save()
    const response = await request(app)
    .get('/api/users')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
   

 
    
  
    
    expect(response.status).toBe(400)
    expect(response.body.data).toEqual([])

    })


  test("should retrieve list of all users", async () => {
  
    
  
    const response = await request(app)
    .get('/api/users')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
   

 
    
  
    
    expect(response.status).toBe(200)
    

  })








})

describe("getUser", () => {
  beforeEach(async () => { await resetDb() })


  



  test("Should return the user's data given by the parameter", async () => {

    
    
  
    const response = await request(app)
    .get('/api/users/user1')
    .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
   

 
    
  
    
    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({username: "user1",email: "user1@gmail.com",role: "Regular"})

  })



 

test("should return error 401 if  called by an authenticated user who is neither admin or the user to be found", async () => {


  const response = await request(app)
  .get('/api/users/user2')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
 
  expect(response.status).toBe(401)


})

test("Should return 400 error if the user not found", async () => {



  const response = await request(app)
  .get('/api/users/user100')
  .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
 


  

  
  expect(response.status).toBe(400)
  expect(response.body.error).toEqual("User not found")
  


})





})

describe("createGroup", () => {
  
  beforeEach(async () => { await resetDb() })

  test("Should Returns a 400 error, and separately the list of all invalid emails ", async () => {
    await Group.deleteMany({})
   
    const body = {name: "Family", memberEmails: ["", "luigi.red@email.com"]}
    const response = await request(app)
    .post('/api/groups')
    .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
    .send(body)
   

 
    
  
    
    expect(response.status).toBe(400)
    expect(response.body.data.message).toEqual("Invalid email format or email with empty string")

})




test("Should Returns an group Object, and separately the emails that where already in a group or doesn't exists  ", async () => {
 
  await Group.deleteMany({})

  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()



  const body = {name: "Family", memberEmails: ["usery@gmail.com", "usery@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(200)


})



test("Should Returns a 400 error if the request body does not contain all the necessary attributes", async () => {
  await Group.deleteMany({})
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()

  const body = { memberEmails: ["usery@gmail.com", "userx@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(400)
  

})


test("Should Returns a 401 error if called by a user who is not authenticated", async () => {
  await Group.deleteMany({})
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'blabla',
})
await userx.save()
await usery.save()

  const body = {name: "Family", memberEmails: ["usery@gmail.com", "userx@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${'blabla'}`)
  .send(body)
 


  

  
  expect(response.status).toBe(401)


})






test("Should  Returns a 400 error if the group name passed in the request body is an empty string", async () => {
  await Group.deleteMany({})
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()

  const body = {name:" ", memberEmails: ["usery@gmail.com", "userx@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(400)
  
  

})


test("Should Returns a 400 error if the group name passed in the request body represents an already existing group in the database", async () => {
 
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})


const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()

  const body = {name:"group1", memberEmails: ["usery@gmail.com", "userx@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(400)

})
   


test("Should Returns a 400 error if the user who calls the API is already in a group", async () => {
 
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()

  const body = {name:"testing", memberEmails: ["usery@gmail.com", "userx@gmail.com"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(400)
 
})



test("Should Returns a 400 error if all emails are already in group or does not exists", async () => {
  await Group.deleteMany({})
  const userx = new User({
    username: 'userx',
    email: 'userx@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwMDU5LCJleHAiOjE2ODY0OTQ4NTl9.fo2HsM9pH8PgiHVa001naOI6wSH92hXlM98nSMPP68w',
})

const usery = new User({
    username: 'usery',
    email: 'usery@gmail.com',
    password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
    role: 'Regular',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIzQGdtYWlsLmNvbSIsImlkIjoiNjQ2ZjUzMzljOGJmNDQ5NWNmZTU5ODkxIiwidXNlcm5hbWUiOiJ1c2VyMyIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1ODkwNTQyLCJleHAiOjE2ODY0OTUzNDJ9.AP7VaTpqS_4V8z7ZtfreidEPVKnnURHEroIpcGq8SFI',
})
await userx.save()
await usery.save()


  const body = {name:"testing", memberEmails: ["user@bkab.it","user@bkab.it"]}


  const response = await request(app)
  .post('/api/groups')
  .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)
  .send(body)
 


  

  
  expect(response.status).toBe(400)
  
 
})

})

  describe("getGroups", () => {
    beforeEach(async () => {
      await User.deleteMany();
      await Group.deleteMany();
    })
    afterAll(async () => {
      
      await User.deleteMany();
      await Group.deleteMany();
    });
    
  
    test('Should return 200 & the list of all the groups', async () => {
      const refreshTokenUserA = jwt.sign({email: 'user1@gmail.com',username: 'user1',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '7d' });
      const accessTokenUserA = jwt.sign({email: 'user1@gmail.com',username: 'user1',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '1h' });
      const userA = await User.create({
        username: 'user1',
        email: 'user1@gmail.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Regular',
        refreshToken: refreshTokenUserA,
        accessToken: accessTokenUserA,
      });
      const refreshTokenUserB = jwt.sign({email: 'user2@gmail.com',username: 'user2',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '7d' });  
      const accessTokenUserB = jwt.sign({email: 'user2@gmail.com',username: 'user2',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '1h' });
      const userB = await User.create({
        username: 'user2',
        email: 'user2@gmail.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Regular',
        refreshToken: refreshTokenUserB,
        accessToken: accessTokenUserB,
      });
      const refreshTokenUserC = jwt.sign({email: 'user3@gmail.com',username: 'user3',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '7d' });
      const accessTokenUserC = jwt.sign({email: 'user3@gmail.com',username: 'user3',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '1h' });
      const userC = await User.create({
        username: 'user3',
        email: 'user3@gmail.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Regular',
        refreshToken: refreshTokenUserC,
        accessToken: accessTokenUserC,
      });
      const refreshTokenUserAdmin = jwt.sign({email: 'adminadmin@gmail.com',username: 'adminadmin',role: 'Admin',},process.env.ACCESS_KEY,{ expiresIn: '7d' });
      const accessTokenUserAdmin = jwt.sign({email: 'adminadmin@gmail.com',username: 'adminadmin',role: 'adminadmin',},process.env.ACCESS_KEY,{ expiresIn: '1h' });
      const adminadmin = await User.create({
        username: 'adminadmin',
        email: 'adminadmin@gmail.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Admin',
        refreshToken: refreshTokenUserAdmin,
        accessToken: accessTokenUserAdmin,
      });
      const groupA = new Group({
        name: 'GroupA',
        members: [{ email: userA.email, _id: userA._id }, { email: userB.email, _id: userB._id }],
      });
      const groupB = new Group({
        name: 'GroupB',
        members: [{ email: userC.email, _id: userC._id }],
      });
      await groupA.save(); 
      await groupB.save(); 
      const response = await request(app)
        .get('/api/groups')
        .set("Cookie", `accessToken=${refreshTokenUserAdmin}; refreshToken=${refreshTokenUserAdmin}`)
  
      
      expect(response.status).toBe(200);
      expect(response.body.data).toContainEqual({
        name: 'GroupA',
        members: [{ email: 'user1@gmail.com' }, { email: 'user2@gmail.com' }],
      });
      expect(response.body.data).toContainEqual({
        name: 'GroupB',
        members: [{ email: 'user3@gmail.com' }],
      });
    });
    test('Should return 401 for the verifyAuth', async () => {
      const refreshTokenUserA = jwt.sign({email: 'user1@gmail.com',username: 'user1',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '7d' });
      const accessTokenUserA = jwt.sign({email: 'user1@gmail.com',username: 'user1',role: 'Regular',},process.env.ACCESS_KEY,{ expiresIn: '1h' });
      const userA = await User.create({
        username: 'user1',
        email: 'user1@gmail.com',
        password: await bcrypt.hash('password123', 12),
        role: 'Regular',
        refreshToken: refreshTokenUserA,
        accessToken: accessTokenUserA,
      });
      const response = await request(app)
        .get('/api/groups')
        .set("Cookie", `accessToken=${accessTokenUserA}; refreshToken=${refreshTokenUserA}`)
  
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('You are not an Admin');
      
    });
  
  
  })


describe("getGroup", () => {
  beforeEach(async () => { await resetDb() })
  test('Should returns the group if called by admin', async () => {

    const response = await request(app)
      .get('/api/groups/group1')
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ members: [{email: "user1@gmail.com"},{email: "user2@gmail.com"}], name: "group1" })
  });

  test('Should returns error 400 if the groupName is not associatied with a group, called by Admin', async () => {

    const response = await request(app)
      .get('/api/groups/group3')
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("The group group3 does not exist")
  });

  test('Should returns error 400 if the groupName is not associatied with a group, called by Regular', async () => {

    const response = await request(app)
      .get('/api/groups/group3')
      .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("The group group3 does not exist")
  });

  test('Should returns error 401 if the user is not associated with that groupName passed by params, called by Regular', async () => {

    const response = await request(app)
      .get('/api/groups/group2')
      .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Your email is not in the group")
  });

  test('Should returns the group if caller is a normal user', async () => {

    const response = await request(app)
      .get('/api/groups/group1')
      .set("Cookie", `accessToken=${userAccessToken}; refreshToken=${userRefreshToken}`)

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({"members": [{email: "user1@gmail.com"}, {email: "user2@gmail.com"}], "name": "group1"})
  });

  test('Missing access token', async () => {

    const response = await request(app)
      .get('/api/groups/group1')
      .set("Cookie", `accessToken=; refreshToken=${userRefreshToken}`)

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Unauthorized")
  });

  test('Missing refresh token', async () => {

    const response = await request(app)
      .get('/api/groups/group1')
      .set("Cookie", `accessToken=${userAccessToken}; refreshToken=`)

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Unauthorized")
  });

})

describe("addToGroup", () => { 

  beforeEach(async () => { await resetDb() })
  
    
  test("Should add members to the group and display if called by admin ", async () => {
   

    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuse1r',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser1@example.com"]}

 

    const response = await request(app)
    .patch('/api/groups/group1/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(200);
  expect(response.body.data).toEqual({"alreadyInGroup": [], "group": {"members": [{email: "user1@gmail.com"}, {email: "user2@gmail.com"}, {email: "testuser1@example.com"}], "name": "group1"}, "membersNotFound": []})
});

   
 
  


  test("Should return error 401 if a Regular user try the admin Route  ", async () => {
     
    
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuse1r',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser1@example.com"]}

 

    const response = await request(app)
    .patch('/api/groups/group1/insert')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(401);
  
  })

  test("Should add members to the group and display if called by Regular ", async () => {
   await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(200);
 
 
  })

  test("Should returns error 401 if the  user is not authorized for that Group ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser3}; refreshToken=${refreshTokenuser3}`)
    .send(body)

  expect(response.status).toBe(401);

 
 
  })


  test(" User...Should returns error 400 if the  group does not exists ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupxasd/add')
    .set("Cookie", `accessToken=${accessTokenuser3}; refreshToken=${refreshTokenuser3}`)
    .send(body)

  expect(response.status).toBe(400);
  

 
  })

  test(" Admin...Should returns error 400 if the  group does not exists ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupxasd/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(400);
  
  

 
  })






  test("Should returns error 400 if the email array is missing ", async () => {
     
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
     }

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser3}; refreshToken=${refreshTokenuser3}`)
    .send(body)

  expect(response.status).toBe(400);


 

 
  })

  test("Regular User Should returns error 400 if the email array is empty ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: []}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(400);
 

 
  })


  test("Admin -- Should returns error 400 if the email array is empty ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: []}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(400);


 
  })






  test("Admin-Should returns error 400 if some email are invalid ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalidemail.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(400);



 
  })

  test("Regular-Should returns error 400 if some email are invalid ,Regular", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalidemail.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(400);

  })





  test("Should returns error 404 if the param  is empty,Regular User ", async () => {
     
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalid@email.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/add')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(404);

 
  })

  test("AdminRouteShould returns error 404 if the param  is empty", async () => {
     
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalid@email.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(404);

 
  })

 
 




  test("Regular user Should returns error 400 if all email does not exists or are already in a group  ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalid@email.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/add')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

  expect(response.status).toBe(400);

 
  })



  test("Admin Route Should returns error 400 if all email does not exists or are already in a group", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["invalidemail.it"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/insert')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

  expect(response.status).toBe(400);

 
  })

})

describe("removeFromGroup", () => { 
  beforeEach(async () => { await resetDb() })
  test("Should return a 401 error if user not authenticated", async () => {
     
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser5',
      email: 'testuser5@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser5@example.com"]}

 
    const response = await request(app)
    .patch('/api/groups/group1/pull')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("user not found")
  
  })

  test("Should return a 400 error if the group name is not passed as a route parameter", async () => {
     
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser5',
      email: 'testuser5@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser5@example.com"]}

 
    const response = await request(app)
    .patch('/api/groups//pull')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=`)
    .send(body)

    expect(response.status).toBe(404);
    //expect(response.body.error).toBe('Missing attributes in the params')
  
  })

  test("Should return a 401 error if the user is not an admin", async () => {
     
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser5',
      email: 'testuser5@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Admin",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser5@example.com"]}

 
    const response = await request(app)
    .patch('/api/groups/groupx/pull')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("You are not an Admin")
  
  })

  test("Regular user Should return error 401 if trying the admin Route  ", async () => {
     
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser5@example.com',
        username: 'testuser5',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser5',
      email: 'testuser5@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });

    const body = {
      emails: ["testuser5@example.com"]}

 
    const response = await request(app)
    .patch('/api/groups/group1/pull')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("You are trying to use an Admin route while still a Regular")
  
  })

  test("Should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()

    const refreshTokenuser4 = jwt.sign(
      {
        email: 'testuser4@example.com',
        username: 'testuser4',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser4 = jwt.sign(
      {
        email: 'testuser4@example.com',
        username: 'testuser4',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user4= await User.create({
      username: 'testuser4',
      email: 'testuser4@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser4,
      accessToken: accessTokenuser4,
    });
    await user4.save()
    
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser2@example.com" },{ email: "testuser3@example.com" },{ email: "testuser4@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Your email is not in the group")
 
 
  })

  test("Regular user Should a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("All the provided emails represent users that do not belong to the group or do not exist in the database")
 
 
  })

  test("Admin user Should a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/pull')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("All the provided emails represent users that do not belong to the group or do not exist in the database")
 
 
  })

  test("Regular user Should a 400 error if the group contains only one member before deleting any user", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
  
    
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("This group contains only 1 member, so you can't delete it")
 
 
  })

  test("Admin user Should a 400 error if the group contains only one member before deleting any user", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
  
    
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/pull')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("This group contains only 1 member, so you can't delete it")
 
 
  })

  test("Regular User Should return a 400 error if at least one of the emails is not in a valid email format or is an empty string", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com", ""]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Invalid email format or email with empty string: ") 
 
  })

  test("Admin User Should return a a 400 error if at least one of the emails is not in a valid email format or is an empty string", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com", " "]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/pull')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Invalid email format or email with empty string:  ")
   
  })

  test("Regular User Should return a 400 error if the group name passed as a route parameter does not represent a group in the database ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/group/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Group does not exist") 
 
  })

  test("Admin User Should return a 400 error if the group name passed as a route parameter does not represent a group in the database", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/group/pull')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Group does not exist")
   
  })

  test("Regular User Should return a 200 success code if the body user is removed ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/remove')
    .set("Cookie", `accessToken=${accessTokenuser1}; refreshToken=${refreshTokenuser1}`)
    .send(body)

    expect(response.status).toBe(200);
    expect(response.body.data.group.name).toEqual("groupx")
    expect(response.body.data.group.members[0].email).toEqual("testuser1@example.com")
    expect(response.body.data.group.members[1].email).toEqual( "testuser2@example.com")
 
 
  })

  test("Admin User Should return a 200 success code if the body user is removed ", async () => {
    await resetDb()
    const refreshTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser1 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser1',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user1 = await User.create({
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser1,
      accessToken: accessTokenuser1,
    });
    await user1.save()
    const refreshTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser2 = jwt.sign(
      {
        email: 'testuser2@example.com',
        username: 'testuser2',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user2 = await User.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser2,
      accessToken: accessTokenuser2,
    });
    await user2.save()
    const refreshTokenuser3 = jwt.sign(
      {
        email: 'testuser3@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser3 = jwt.sign(
      {
        email: 'testuser1@example.com',
        username: 'testuser3',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user3= await User.create({
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser3,
      accessToken: accessTokenuser3,
    });
    await user3.save()
  

    const body = {
      emails: ["testuser3@example.com"]}

      const group_new = new Group({
        name: 'groupx',
        members: [{ email: "testuser1@example.com" },{ email: "testuser2@example.com" },{ email: "testuser3@example.com" }]
      })
      await group_new.save()

    const response = await request(app)
    .patch('/api/groups/groupx/pull')
    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
    .send(body)

    expect(response.status).toBe(200);
    expect(response.body.data.group.name).toEqual("groupx")
    expect(response.body.data.group.members[0].email).toEqual("testuser1@example.com")
    expect(response.body.data.group.members[1].email).toEqual( "testuser2@example.com")
 
 
  })

})

describe("deleteUser", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Group.deleteMany();
    await transactions.deleteMany();
    await categories.deleteMany();
  })

  test("Return 200 OK", async()=>{
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    const user1 = await User.create({
      username: 'user1',
      email: 'user1@gmail.com',
      password: '$2a$12$PLj4wPqaqF2vjmnmOzN3C.tBSJqfXTZH22aiI96g914HkbTIhfRLe',
      role: 'Regular',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsImlkIjoiNjQ2NGJiZWNhZGYyYzM4NzBjNGIwNjgyIiwidXNlcm5hbWUiOiJ1c2VyMSIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg2MTcwMTEwLCJleHAiOjE3MTc3MDYxMTB9.s1d1nvaq9oIKJRv33ue1iCMw2EwG7HXIZP18HeUl3fU',
  })

    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user1.email,
          user: user1._id,
        },
      ],
    });  
    await transactions.create({
      username: user1.username,
      type: 'investment',
      amount: 100,
    });  
    const response = await request(app)
    .delete('/api/users')
    .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
    .send({ email: user1.email });

    expect(response.status).toBe(200);
    expect(response.body.data.deletedTransactions).toBe(1);
    expect(response.body.data.deletedFromGroup).toBe(true);
  })
  test("Return 200 and delete the group if the user is the last in the group", async () => {
    const refreshTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser,
      accessToken: accessTokenuser,
    });
    const refreshTokenAdmin = jwt.sign(
      {
        email: 'testadmin@example.com',
        username: 'testadmin',
        role: "Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenAdmin = jwt.sign(
      {
        email: 'testadmin@example.com',
        username: 'testadmin',
        role: "Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const admin = await User.create({
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Admin",
      refreshToken: refreshTokenAdmin,
      accessToken: accessTokenAdmin,
    });
    const group = await Group.create({
      name: "testgroup",
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });
    const response = await request(app)
      .delete("/api/users")
      .set("Cookie", `refreshToken=${refreshTokenAdmin};accessToken=${accessTokenAdmin}`)
      .send({ email: user.email });
    expect(response.status).toBe(200);
    expect(response.body.data.deletedFromGroup).toBe(true);
    const deletedGroup = await Group.findOne({ name: group.name });
    expect(deletedGroup).toBeNull();
  });
  test("Return 200 and do not delete the group if there are other members in the group", async () => {
    const refreshTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );
  
    const accessTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenuser,
      accessToken: accessTokenuser,
    });
    const refreshTokenAdmin = jwt.sign(
      {
        email: 'testadmin@example.com',
        username: 'testadmin',
        role: "Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );
  
    const accessTokenAdmin = jwt.sign(
      {
        email: 'testadmin@example.com',
        username: 'testadmin',
        role: "Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const admin = await User.create({
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Admin",
      refreshToken: refreshTokenAdmin,
      accessToken: accessTokenAdmin,
    });
  
    const group = await Group.create({
      name: "testgroup",
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });
  
    const refreshTokenAnotherUser = jwt.sign(
      {
        email: 'anotheruser@example.com',
        username: 'anotheruser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );
  
    const accessTokenAnotherUser = jwt.sign(
      {
        email: 'anotheruser@example.com',
        username: 'anotheruser',
        role: "Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const anotherUser = await User.create({
      username: 'anotheruser',
      email: 'anotheruser@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenAnotherUser,
      accessToken: accessTokenAnotherUser,
    });
    const anotherUser1 = await User.create({
      username: 'anotheruser1',
      email: 'anotheruse1r@example.com',
      password: await bcrypt.hash('password123', 12),
      role: "Regular",
      refreshToken: refreshTokenAnotherUser,
      accessToken: accessTokenAnotherUser,
    });
  
    group.members.push({
      email: anotherUser.email,
      user: anotherUser._id,
    });
    await group.save();

    group.members.push({
      email: anotherUser1.email,
      user: anotherUser1._id,
    });
    await group.save();

  
    const response = await request(app)
      .delete("/api/users")
      .set("Cookie", `refreshToken=${refreshTokenAdmin};accessToken=${accessTokenAdmin}`)
      .send({ email: user.email });
    expect(response.status).toBe(200);
    expect(response.body.data.deletedFromGroup).toBe(true);
    const updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.members.length).toBe(2);
    expect(updatedGroup.members.some(member => member.email === user.email)).toBe(false);
  });
  test("Return 401 verifyAuth", async()=>{
    const refreshTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role:"Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessTokenuser = jwt.sign(
      {
        email: 'testuser@example.com',
        username: 'testuser',
        role:"Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Regular",
      refreshToken: refreshTokenuser,
      accessToken: accessTokenuser,
    });
    const response = await request(app)
    .delete('/api/users')
    .set('Cookie', `refreshToken=${refreshTokenuser};accessToken=${accessTokenuser}`)
    .send({ email: user.email });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('You are not an Admin');
  })
  test("Return 400 Missing attribute in the request body", async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    
    const response = await request(app)
      .delete('/api/users')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send();
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing attribute in the request body');
  });
  test("Return 400 if the parameter is empty in the request body", async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    
    const response = await request(app)
      .delete('/api/users')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({email:""});
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('The attribute in the request body is empty');
  });
  test("Return 400 email format is not correct", async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    
    const response = await request(app)
      .delete('/api/users')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({ email: 'invalidemail' });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('email format is not correct');
  });
  test("Return 400 User not found", async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    
    const response = await request(app)
      .delete('/api/users')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({ email: 'nonexistent@gmail.com' });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User not found');
  });
  
  
  


 })

describe("deleteGroup", () => { 
  beforeEach(async () => {
    await User.deleteMany();
    await Group.deleteMany();
  })
  afterAll(async () => {
    
    await User.deleteMany();
    await Group.deleteMany();
  });
  test('returns a 200 OK response when a valid group name is provided with a valid refresh token', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });

    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });    
  

    const response = await request(app)
      .delete('/api/groups')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({ name: group.name });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({"message": 'Group testgroup has been deleted'});
  });
  test('returns a 400 error response when the group name is empty', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });  

  
    const response = await request(app)
      .delete('/api/groups')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({ name: "" });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('The attribute in the request body is empty');
  });
  test('returns a 400 error response when the group name is missing in the parameters', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });  

  
    const response = await request(app)
      .delete('/api/groups')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({ });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing attribute in the request body');
  });
  test('returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Regular"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Regular",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });  

  
    const response = await request(app)
      .delete('/api/groups')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({name:group.name });
  
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('You are not an Admin');
  });
  
  test('returns a 400 Group doesnt exist', async () => {
    const refreshToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
      {
        email: 'test@example.com',
        username: 'test',
        role:"Admin"
      },
      process.env.ACCESS_KEY,
      { expiresIn: '1h' }
    );
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 12),
      role:"Admin",
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });  
    const not_a_group = "btsbtsbtsbtsbts";

  
    const response = await request(app)
      .delete('/api/groups')
      .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
      .send({name:not_a_group });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(`Group ${not_a_group} does not exist`);
  });
})
