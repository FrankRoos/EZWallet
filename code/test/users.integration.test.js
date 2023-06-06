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
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU4OTUwMDMsImV4cCI6MTcxNzQ1MjYwM30.B03SFlq-17RHpc_b93EcYIwWO7DkLf9tKtAfInGRFTY',
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
  beforeEach(async () => { await resetDb() })
  

  test('Should returns the list of all the groups', async () => {

    const response = await request(app)
      .get('/api/groups')
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([{"members": [{"email": "user1@gmail.com"}, {"email": "user2@gmail.com"}], "name": "group1"}, {"members": [{"email": "user3@gmail.com"}], "name": "group2"}])
  });


})

describe("getGroup", () => {
  beforeEach(async () => { await resetDb() })
  test('Should returns the group if called by admin', async () => {

    const response = await request(app)
      .get('/api/groups/group1')
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ members: ["user1@gmail.com", "user2@gmail.com"], name: "group1" })
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
    expect(response.body.data).toEqual({"members": ["user1@gmail.com", "user2@gmail.com"], "name": "group1"})
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

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })


describe("deleteUser", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Group.deleteMany();
    await transactions.deleteMany();
    await categories.deleteMany();
  })
  afterAll(async () => {
    
    await User.deleteMany();
    await Group.deleteMany();
    await transactions.deleteMany();
    await categories.deleteMany();
  });
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

    const group = await Group.create({
      name: 'testgroup',
      members: [
        {
          email: user.email,
          user: user._id,
        },
      ],
    });  
    await transactions.create({
      username: user.username,
      type: 'investment',
      amount: 100,
    });  
    const response = await request(app)
    .delete('/api/users')
    .set('Cookie', `refreshToken=${refreshToken};accessToken=${accessToken}`)
    .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body.data.deleteTransactions).toBe(1);
    expect(response.body.data.deletedFromGroup).toBe(true);
  })
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
    expect(response.body.data).toBe(`Group ${group.name} has been deleted`);
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
