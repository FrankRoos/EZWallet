import request from 'supertest';
import { app } from '../app';
import { Group, User }  from '../models/User.js';

import * as utils from "../controllers/utils.js";
import * as users from "../controllers/users.js"
import { PromiseProvider } from 'mongoose';


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


  test("Catch Block Test", async () => {

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
    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;

    jest.spyOn(User, "find").mockImplementation(() => [])
 
    await users.getUsers(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

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

   test("Catch Block Try", async () => {
   
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
    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;


    const username = jest.fn((username)=> {return username});
    utils.handleString = username;

    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
    .mockReturnValueOnce(retrievedUser)  //second call
 
    await users.getUser(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

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

describe("createGroup", () => {

 beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear() 
    jest.restoreAllMocks()
    
  });

  test("Should Returns a 400 error, and separately the list of all invalid emails ", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name: 'Test Group',
      memberEmails: ['member1@example.com', 'member.example.com'],

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };

    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
    const existingUser1 = {
      email: 'member1@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser1',
      
    };
    const existingUser2 = {
      email: 'member2@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser2',
      
    };

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
      
    //jest.spyOn(User,"findOne").mockImplementationOnce(()=>(Promise.resolve(callingUser)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser1)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser2)))
    jest.spyOn(User, "findOne").mockReturnValueOnce(true) 
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    
  
    
    await users.createGroup(mockReq, mockRes)
   

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
     { "data": {"invalidEmails":["member.example.com"],
      "message": "Invalid email format or email with empty string"},
        "refreshedTokenMessage" : "" }  )

 
  })

  test("Catch Block Try", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name: 'Test Group',
      memberEmails: ['member1@example.com', 'member.example.com'],

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };

    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
    const existingUser1 = {
      email: 'member1@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser1',
      
    };
    const existingUser2 = {
      email: 'member2@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser2',
      
    };

    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
      
    //jest.spyOn(User,"findOne").mockImplementationOnce(()=>(Promise.resolve(callingUser)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser1)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser2)))
    jest.spyOn(User, "findOne").mockReturnValueOnce(true) 
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    
  
    
    await users.createGroup(mockReq, mockRes)
   

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

 
  })


  test("Should Returns an group Object, and separately the emails that where already in a group or doesn't exists  ", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name: 'Test Group',
      memberEmails: ['member1@example.com', 'member2@example.com'],

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };

    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
    const existingUser1 = {
      email: 'member1@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser1',
      
    };
    const existingUser2 = {
      email: 'member2@example.com',
      password: 'hashedPassword',
      _id: 'someId',
      username: 'testUser2',
      
    };

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
      
    //jest.spyOn(User,"findOne").mockImplementationOnce(()=>(Promise.resolve(callingUser)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser1)))
    //.mockImplementationOnce(()=>(Promise.resolve(existingUser2)))
    jest.spyOn(User, "findOne").mockReturnValueOnce(true) 
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)  
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    jest.spyOn(User, "findOne").mockReturnValueOnce(true)
    jest.spyOn(Group, "findOne").mockReturnValueOnce(null)
    
  
    
    await users.createGroup(mockReq, mockRes)
   

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(
     { "data":  {"alreadyInGroup": [],
                 "group": { "members": [{"email": "member1@example.com",
                            "user": undefined },{"email": "member2@example.com",
                            "user": undefined }   ],
                   "name": "Test Group"}, 
          "membersNotFound": []
        },
        "refreshedTokenMessage" : "" }  )

 
  })



  test("Should Returns a 400 error if the request body does not contain all the necessary attributes", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      //name :"MikiMouse",  does not contains name
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn((name)=> {return name});
    utils.handleString = name;

    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attributes in the request body", refreshedTokenMessage: ""})
 

  })


  test("Should Returns a 401 error if called by a user who is not authenticated", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      //name :"MikiMouse",  does not contains name
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;


    const name = jest.fn((name)=> {return name});
    utils.handleString = name;

    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
 

  })


  test("Should  Returns a 400 error if the group name passed in the request body is an empty string", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name :"", 
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation(()=> {throw new Error("Empty string: name")});
    utils.handleString = name;
    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Empty string: name", refreshedTokenMessage: ""})
 

  })

  test("Should Returns a 400 error if the group name passed in the request body represents an already existing group in the database", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name :"mikimouse", 
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
     


    jest.spyOn(Group, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "There is already an existing group with the same name", refreshedTokenMessage: ""})
 

  })
     


  test("Should Returns a 400 error if the user who calls the API is already in a group", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name :"mikimouse", 
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
     


    jest.spyOn(Group, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(false)  //first call
    .mockReturnValueOnce(true)  //first call

 
    await users.createGroup(mockReq, mockRes)

   

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "You are already a member of a group", refreshedTokenMessage: ""})
 

  })



  test("Should Returns a 400 error if all emails are already in group", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name :"mikimouse", 
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    }
    
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;

    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
   
     


    jest.spyOn(Group, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(false)  //first call
    .mockReturnValueOnce(false)  //first call
    .mockReturnValueOnce("alredyingroup")  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error: "all the `memberEmails` either do not exist or are already in a group", refreshedTokenMessage: ""})
 

  })


  test("Should Returns a 401 error if all member emails doensnt exists ", async () => {
   
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {
      name :"mikimouse", 
      memberEmails:["topolino@email.it","pippo@email.it"]

    }
      }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    }

    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;


    const name = jest.fn().mockImplementation((name)=> {return name});
    utils.handleString = name;
    jest.spyOn(User, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(true)  //first call
    .mockReturnValueOnce(false)
     

   
    jest.spyOn(Group, "findOne")
    .mockReturnValue(1)   //default
    .mockReturnValueOnce(false)  //first call
    .mockReturnValueOnce(false)  //first call
    .mockReturnValueOnce(false)  //first call

 
    await users.createGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error: "all the `memberEmails` either do not exist or are already in a group", refreshedTokenMessage: ""})
 

  })




  
 





      
        
        
        afterEach(()=>{jest.restoreAllMocks();})
  })


describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })