import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import * as utils from "../controllers/utils.js";
import * as users from "../controllers/users.js"
/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")
jest.mock("../controllers/utils.js")
// jest.mock("../controllers/users.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */

describe("getUsers", () => {

  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
  
    //additional `mockClear()` must be placed here
  });

  test("should return error 401 if  called by an authenticated user who is not an admin", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue({array: 'emptyArray'}),
      locals: {
        message: ""
      }
    }
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;

    jest.spyOn(User, "find").mockImplementation(() => [])
 
    await users.getUsers(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(401)

  })

  test("should return empty list if there are no users", async () => {


    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue(),
      locals: {
        message: ""
      }
    }
      // User.find.mockClear()
      const obj = false
      jest.spyOn(User,"find").mockImplementation(() => {return obj})
      jest.spyOn(User, "findOne").mockImplementation(() => {return false})
  
      //any time the User.find() method is called jest will replace its actual implementation with the one defined below
      const verify = jest.fn(()=> {return true});
      utils.verifyAuth = verify;
  
  
      await users.getUsers(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({data: [], refreshedTokenMessage: ""})
  
    })


  test("should retrieve list of all users", async () => {
  
    
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue({array: 'emptyArray'}),
      locals: {
        message: ""
      }
    }
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1', role: 'regular' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2', role: 'regular' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const veriFy = jest.fn(()=> {return true});
    utils.verifyAuth = veriFy;


  
    await users.getUsers(mockReq, mockRes)
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: retrievedUsers, refreshedTokenMessage: ""})
    
  })
})




describe("getUser", () => {
  
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
  
    //additional `mockClear()` must be placed here
  });



  test("Should return the user's data given by the parameter", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    params:{username: 'michelangelo'}
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    }

    const retrievedUser = {  email: 'test1@example.com', password: 'hashedPassword1', username: 'michelangelo' ,role: 'regular'}
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const username = jest.fn((username)=> {return username});
    utils.handleString = username;

    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
    .mockReturnValueOnce(retrievedUser)  //second call
 
    await users.getUser(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: retrievedUser, refreshedTokenMessage: ""})

  })

  test("Should return 400 error if the user not found", async () => {


   //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
   const mockReq = {
    cookies: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    
  },
  params:{username: 'michelangelo'}
    }
  const mockRes = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockResolvedValue({array: 'emptyArray'}),
    locals: {
      message: ""
    }
  }

  const retrievedUser = []
  const verify = jest.fn(()=> {return {flag:true}});
  utils.verifyAuth = verify;


  const username = jest.fn((username)=> {return username});
  utils.handleString = username;

  jest.spyOn(User, "findOne")
  .mockReturnValue(1)   //default
  .mockReturnValueOnce(true)  //first call
  .mockReturnValueOnce(false)  //second call

  await users.getUser(mockReq, mockRes)

  
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({error: "User not found" , refreshedTokenMessage: ""})

})

test("should return error 401 if  called by an authenticated user who is neither admin or the user to be found", async () => {


  //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
  const mockReq = {
   cookies: {
     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
   
 },
 params:{username: 'michelangelo'}
   }
 const mockRes = {
   cookie: jest.fn(),
   status: jest.fn().mockReturnThis(),
   json: jest.fn().mockResolvedValue({array: 'emptyArray'}),
   locals: {
     message: ""
   }
 }

 const retrievedUser = []
 const verify = jest.fn(()=> {return {flag:false}});
 utils.verifyAuth = verify;


 const username = jest.fn((username)=> {return username});
 utils.handleString = username;

 jest.spyOn(User, "findOne")
 .mockReturnValue(1)   //default
 .mockReturnValueOnce(true)  //first call
 .mockReturnValueOnce(false)  //second call

 await users.getUser(mockReq, mockRes)

 
 expect(mockRes.status).toHaveBeenCalledWith(401)
 
 

})

test("Return error 404 if the username param is empty", async () => {


  //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
  const mockReq = {
   cookies: {
     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
   
 },
 params:{username: 'michelangelo'}
   }
 const mockRes = {
   cookie: jest.fn(),
   status: jest.fn().mockReturnThis(),
   json: jest.fn().mockResolvedValue({array: 'emptyArray'}),
   locals: {
     message: ""
   }
 }

 const retrievedUser = []
 const verify = jest.fn(()=> {return {flag:false}});
 utils.verifyAuth = verify;


 const username = jest.fn().mockImplementation(()=> {throw new Error("Empty string: username")});
 utils.handleString = username;

 jest.spyOn(User, "findOne")
 .mockReturnValue(1)   //default
 .mockReturnValueOnce(true)  //first call
 .mockReturnValueOnce(false)  //second call

 await users.getUser(mockReq, mockRes)


 expect(mockRes.status).toHaveBeenCalledWith(404)
 expect(mockRes.json).toHaveBeenCalledWith({error: "Service Not Found. Reason: Empty string: username", refreshedTokenMessage: ""})
 

})



})

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })