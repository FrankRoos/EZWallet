import request from 'supertest';
import { app } from '../app';
import { Group, User }  from '../models/User.js';
import { transactions }  from '../models/model.js';

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

  test("Should return empty list if there are no users", async () => {


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
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', role: 'regular' }, { username: 'test2', email: 'test2@example.com', role: 'regular' }]
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

    const retrievedUser = {  email: 'test1@example.com', username: 'michelangelo' ,role: 'regular'}
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

   test("Catch Block Test", async () => {
   
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

 

test("Should return error 401 if  called by an authenticated user who is neither admin or the user to be found", async () => {


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

test("Should return error 404 if the username param is empty", async () => {


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


afterEach(() => {
  User.find.mockClear()
  User.findOne.mockClear()
  User.prototype.save.mockClear()


  //additional `mockClear()` must be placed here
});
})

describe("createGroup", () => {

 beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear() 
    jest.restoreAllMocks()
    
  });

  test("Should Return a 400 error, and separately the list of all invalid emails ", async () => {
   
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


  test("Should Return an group Object, and separately the emails that where already in a group or doesn't exists  ", async () => {
   
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
      email: 'callinguser@email.it'
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
    jest.spyOn(User, "findOne").mockReturnValueOnce({email: 'callinguser@email.it'}) 
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
                 "group": { "members": [{"email": "member1@example.com"},
                 {"email": "member2@example.com"},
                 {"email": "callinguser@email.it"}   ],
                   "name": "Test Group"}, 
          "membersNotFound": []
        },
        "refreshedTokenMessage" : "" }  )

 
  })



  test("Should Return a 400 error if the request body does not contain all the necessary attributes", async () => {
   
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
        message: ""
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


  test("Should Return a 401 error if called by a user who is not authenticated", async () => {
   
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


  test("Should  Return a 400 error if the body miss some parameter in the request body is an empty string", async () => {
   
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
        message: ""
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
    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing attributes in the request body", refreshedTokenMessage: ""})
 

  })


  
  test("Should Return a 400 error if the group name passed in the request body represents an already existing group in the database", async () => {
   
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
     


  test("Should Return a 400 error if the user who calls the API is already in a group", async () => {
   
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


  test("Should Return a 400 error if all emails are already in group", async () => {
   
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

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "all the `memberEmails` either do not exist or are already in a group", refreshedTokenMessage: ""})
 

  })


  test("Should Return a 400 error if all member emails doensnt exists ", async () => {
   
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

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "all the `memberEmails` either do not exist or are already in a group", refreshedTokenMessage: ""})
 

  })


        
        afterEach(()=>{jest.restoreAllMocks();})
  })


describe("getGroups", () => {

  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
  });


test("Should return all  groups ", async () => {
   
      //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
      const mockReq = {
        cookies: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
        
      }
};
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
     
      
      
      const group= [ {name: 'Test Group', members: ['member1@example.com', 'member2@example.com' ] },
      {           name: 'Test Group2', members: ['member3@example.com', 'member4@example.com' ] }  ];
  
  
      const verify = jest.fn(()=> {return {flag:true}});
      utils.verifyAuth = verify;
  
  
   
      
      jest.spyOn(User, "findOne").mockReturnValue(true) 
      jest.spyOn(Group, "find").mockReturnValue(group) 
     
    
      
      await users.getGroups(mockReq, mockRes)
     
  
      
      expect(mockRes.status).toHaveBeenCalledWith(200)
     
  
   
    })

 test("Catch Block Try", async () => {
   
      //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
      const mockReq = {
        cookies: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
        
      }
};
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
     
      
      
      const group= [ {name: 'Test Group', members: ['member1@example.com', 'member2@example.com' ] },
      {           name: 'Test Group2', members: ['member3@example.com', 'member4@example.com' ] }  ];
  
  
      const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
      utils.verifyAuth = verify;
  
  
   
      
      jest.spyOn(User, "findOne").mockReturnValue(true) 
      jest.spyOn(Group, "find").mockReturnValue(group) 
     
    
      
      await users.getGroups(mockReq, mockRes)
     
  
      
      
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})
  
   
    })

test("Should return error 401 if is not called by an admin ", async () => {
   
      //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
      const mockReq = {
        cookies: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
        
      }
};
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
     
      
      
      const group= [ {name: 'Test Group', members: ['member1@example.com', 'member2@example.com' ] },
      {           name: 'Test Group2', members: ['member3@example.com', 'member4@example.com' ] }  ];
  
  
      const verify = jest.fn(()=> {return {flag:false}});
      utils.verifyAuth = verify;
  
  
   
      
      jest.spyOn(User, "findOne").mockReturnValue(true) 
      jest.spyOn(Group, "find").mockReturnValue(group) 
     
    
      
      await users.getGroups(mockReq, mockRes)
     
  
      
      expect(mockRes.status).toHaveBeenCalledWith(401)
      
  
   
    })



  })



 describe("getGroup", () => {
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
  });




  
  test("Should return the group if called by admin ", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Admin", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:true}});
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({"data": {"members" : [{email: "member1@example.com"},{email: "member2@example.com"}] , "name" : "Test Group"}, refreshedTokenMessage: ""})
    
     
      })


   test("Should return error 400 if  the groupName is not associatied with a  group,called by Admin", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Admin", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:true}});
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({error: "The group TestGroup does not exist",refreshedTokenMessage: ""})
    
     
      })



      test("Should return error 400 if  the groupName is not associatied with a  group,called by Regular", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Regular", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:true}});
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({error: "The group TestGroup does not exist",refreshedTokenMessage: ""})
    
     
      })


      test("Should returns error 401 if  the user is not associated with that groupName passed by params,called by Regular", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Regular", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:false}});
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(401)
        
    
     
      })


    test("Should returns error 401 if the admin is not authorized ", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Admin", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag :false }} );
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith({error:"Unauthorized as Admin" , refreshedTokenMessage: ""})
    
     
      })




 test("Should returns the group if caller is a normal user ", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params:{name: 'TestGroup'}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Regular", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:true}});
        utils.verifyAuth = verify;
         
        const groupname = jest.fn((groupname)=> {return groupname});
         utils.handleString = groupname;
    
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({"data": {"members" : [{email: "member1@example.com"},{email: "member2@example.com"}] , "name" : "Test Group"}, refreshedTokenMessage: ""})
    
     
      })
  
   test("Catch Block Try", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
          
        },
        params : {name: 'TestGroup'}
  };
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
       
        
        
        const group= [ {name: 'Test Group', members: ['member1@example.com', 'member2@example.com' ] },
        {           name: 'Test Group2', members: ['member3@example.com', 'member4@example.com' ] }  ];
    
    
        const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
        utils.verifyAuth = verify;
       const user= {role :"Admin", username :"pinco"}
    
     
        
        jest.spyOn(User, "findOne").mockReturnValueOnce(user) 
         
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})
    
     
      })
  

  test("Should return error 404 if the param is empty", async () => {
     
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {
          cookies: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
        },
        params:{name: ''}
  };
        const mockRes = {
          cookie: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            message: ""
          }
        };
        const user= {role :"Regular", username :"pinco"};
        const callingUser = {
          _id: 'mockUserId',
          refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
          username: 'mockUsername',
        };
       
        
        
        const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
                
    
    
        const verify = jest.fn(()=> {return {flag:true}});
        utils.verifyAuth = verify;
         
        
       
    
         const groupname = jest.fn().mockImplementation(()=> {throw new Error("Empty string: groupName")});
         utils.handleString = groupname;
     
        
        jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
        jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
       
      
        
        await users.getGroup(mockReq, mockRes)
       
    
        
        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.json).toHaveBeenCalledWith({error: "Service Not Found. Reason: Empty string: groupName", refreshedTokenMessage: ""})
  
})

test("Should return error 401 if the body misses some cookies", async () => {
     
  //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
  const mockReq = {
    cookies: {
      accessToken: "",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    
  },
  params:{name: 'TestGroup'}
};
  const mockRes = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      message: ""
    }
  };
  const user= {role :"Regular", username :"pinco"};
  const callingUser = {
    _id: 'mockUserId',
    refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
    username: 'mockUsername',
  };
 
  
  
  const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
          


  const verify = jest.fn(()=> {return {flag:true}});
  utils.verifyAuth = verify;
   
  
 

  const groupname = jest.fn((groupname)=> {return groupname});
  utils.handleString = groupname;

  
  jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
  jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
 

  
  await users.getGroup(mockReq, mockRes)
 

  
  expect(mockRes.status).toHaveBeenCalledWith(401)
  expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized", refreshedTokenMessage: ""})

})

test("Should return error 401 if the refresh token is not associated with an User", async () => {
     
  //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
  const mockReq = {
    cookies: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
    
  },
  params:{name: 'TestGroup'}
};
  const mockRes = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      message: ""
    }
  };
  const user= {role :"Regular", username :"pinco"};
  const callingUser = {
    _id: 'mockUserId',
    refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
    username: 'mockUsername',
  };
 
  
  
  const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
          


  const verify = jest.fn(()=> {return {flag:true}});
  utils.verifyAuth = verify;
   
  
 

  const groupname = jest.fn((groupname)=> {return groupname});
  utils.handleString = groupname;

  
  jest.spyOn(User, "findOne").mockResolvedValueOnce(false)
  jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
 

  
  await users.getGroup(mockReq, mockRes)
 

  
  expect(mockRes.status).toHaveBeenCalledWith(401)
  expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized", refreshedTokenMessage: ""})

})
  
 
  })

describe("addToGroup", () => { 
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
    
  });



  test("Should add members to the group and display if called by admin ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {group:  {"members" : [{email: "member1@example.com"},{email:"member2@example.com"},{email: "toyota@polito.it"}] , name : "Test Group"},alreadyInGroup: [],membersNotFound : ["suzuki@polito.it"] }, refreshedTokenMessage: ""})

 
  })


  test("Should return error 401 if a Regular user try the admin Route  ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 1)



  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error :"You are trying to use an Admin route while still a Regular", refreshedTokenMessage: ""})

 
  })

  test("Should add members to the group and display if called by Regular ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)



  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {group:  {"members" : [{email: "member1@example.com"},{email: "member2@example.com"},{email: "toyota@polito.it"}] , name : "Test Group"},alreadyInGroup: [],membersNotFound : ["suzuki@polito.it"] }, refreshedTokenMessage: ""})

 
  })

  test("Should return error 401 if the  user is not authorized for that Group ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;
   
 
     jest.spyOn(User, "findOne").mockResolvedValueOnce(user)

     jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)


     jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
    
    
     
   
 
     
 
    await users.addToGroup(mockReq, mockRes)
    

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    

 
  })


  test("Should return error 400 if the  group does not exists ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

     jest.spyOn(Group.prototype, 'save')
     .mockImplementationOnce(() => Promise.resolve(1))
 
     jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
     jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
    
     
     jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
   
     jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
     
  
 
     jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)
 
    await users.addToGroup(mockReq, mockRes)
    

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error : "Group does not exist" ,refreshedTokenMessage: ""})
 
 
  })


  test("Should return error 401 if the admin is not authorized ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    

 
  })




  test("Should return error 400 if the email array is missing ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ""},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error : "Missing attributes in the request body" ,refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if the email array is empty ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: []},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error : "No member emails provided" ,refreshedTokenMessage: ""})

 
  })


  test("Should return error 400 if the email array is empty Regular", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: []},
    params:{name: 'TestGroup'}
    ,url: "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;
     jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)
 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error : "No member emails provided" ,refreshedTokenMessage: ""})

 
  })


  test("Should return error 400 if the groupName doesnt match with an existings one ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suziki@polito.it","toyotoya@polit.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(false) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error : "Group does not exist" ,refreshedTokenMessage: ""})

 
  })


  test("Should return error 400 if some email are invalid ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suziki@polito.it",""]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ data : { message  : "Invalid email format or email with empty string" , invalidEmails : [""] },refreshedTokenMessage: ""})

 
  })

  test("Should returns error 400 if some email are invalid Regular", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suziki@polito.it",""]},
    params:{name: 'TestGroup'}
    ,url : "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

     jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

   
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ data : { message  : "Invalid email format or email with empty string" , invalidEmails : [""] },refreshedTokenMessage: ""})

 
  })


  test("Should returns error 404 if the param  is empty ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: ''}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn().mockImplementation(()=> {throw new Error("Empty string: groupName")});
 utils.handleString = groupname;


 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Service Not Found. Reason: Empty string: groupName", refreshedTokenMessage: ""})

 
  })



  test("Should returns error 404 if the param  is empty Regular User ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: ''},
    url : "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn().mockImplementation(()=> {throw new Error("Empty string: groupName")});
 utils.handleString = groupname;
  

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Service Not Found. Reason: Empty string: groupName", refreshedTokenMessage: ""})

 
  })

  test("Catch Block Try", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

 
  })




  test("Should returns error 400 if all email does not exists or are already in a group , if called by admin ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   

    jest.spyOn(User, "findOne").mockResolvedValueOnce(false)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "The member emails you provided either don't exist or are already in other groups", refreshedTokenMessage: ""})

 
  })



  test("Should returns error 400 if all email does not exists or are already in a group , if called by Regular ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
    ,url: "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

     jest.spyOn(String.prototype, 'indexOf')
     .mockImplementationOnce(() => 0)
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   

    jest.spyOn(User, "findOne").mockResolvedValueOnce(false)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
  
    
    await users.addToGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "The member emails you provided either don't exist or are already in the group", refreshedTokenMessage: ""})

 
  })



  afterEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear()


  })   
})



describe("removeFromGroup", () => { 
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
    
  });

  test("Should return error 401 if a Regular user try the admin Route  ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 1)



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error :"You are trying to use an Admin route while still a Regular", refreshedTokenMessage: ""})

 
  })


  test("Should return error 401 if the user is not authorized for that group  ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'toyota@polito.it'}, {email: 'member2@example.com' }, {email: 'Quellochevuoitu@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    

 
  })


  test("Should return error 400 if the group final lenght is 1  ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'toyota@polito.it'}], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(User, "findOne").mockResolvedValueOnce({email :"suzuki@polito.it", _id : 2})

    
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "This group contains only 1 member, so you can't delete it", refreshedTokenMessage: ""})
    

 
  })
  

  test("Catch Block Try", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if the group does not exist,Regular", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'toyota@polito.it'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Group does not exist", refreshedTokenMessage: ""})
    

 
  })

  test("Should return error 400 if some email are invalid  ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["","toyota@polito.it"]},
    params:{name: 'TestGroup'},
    url:  "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'toyota@polito.it'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Invalid email format or email with empty string: ", refreshedTokenMessage: ""})
    

 
  })

  test("Should remove members to the group and display if called by admin ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoremove1= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@polito.it'}, {email: 'suzuki@polito.it' },{email:'birilubbina@salve.it'} ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoremove1)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {group:  {"members" : [{email:"member1@polito.it"},{email: "birilubbina@salve.it"}] , name : "Test Group"},membersNotFound : ["toyota@polito.it"],notInGroup: [] }, refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if some email are invalid", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoremove1= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@polito.it'}, {email: 'suzuki@polito.it' },{email:'birilubbina@salve.it'} ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoremove1)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error:"Invalid email format or email with empty string: ", refreshedTokenMessage: ""})

 
  })

  test("Should remove members to the group and display if called by regular user ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
    ,url: "a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoremove1= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@polito.it'}, {email: 'suzuki@polito.it' },{email:'birilubbina@salve.it'} ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoremove1)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))

    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)

  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {group:  {"members" : [{email:"member1@polito.it"},{email: "birilubbina@salve.it"}] , name : "Test Group"},membersNotFound : ["toyota@polito.it"],notInGroup: [] }, refreshedTokenMessage: ""})

 
  })


  test("Should return error 400 if we end with a group with lenght 1", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoremove1= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [{email: 'toyota@polito.it' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoremove1)
    jest.spyOn(User, "findOne").mockResolvedValueOnce({email :"suzuki@polito.it", _id : 2})
    
    jest.spyOn(Group, "findOne").mockResolvedValue(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementation(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "This group contains only 1 member, so you can't delete it", refreshedTokenMessage: ""})

 
  })


  test("Should return error 400 if all provided emails does not exists or don't belong to the group", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
  
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error :"All the provided emails represent users that do not belong to the group or do not exist in the database", refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if all provided emails does not exists or don't belong to the group,Regular", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
    ,url :"a"
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Regular", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
  
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



    jest.spyOn(String.prototype, 'indexOf')
    .mockImplementationOnce(() => 0)
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error :"All the provided emails represent users that do not belong to the group or do not exist in the database", refreshedTokenMessage: ""})

 
  })
  test("Should return error 400 if the group does not exists, Admin Route ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error :"Group does not exist", refreshedTokenMessage: ""})

 
  })

  test("Should return error 401 if the admin is not authorized, Admin Route ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    

 
  })

  test("Should return error 400 if the calling user does not exists, Admin Route ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error :"user not found", refreshedTokenMessage: ""})

 
  })

  test("Should return error 404 if some params are missing, Admin Route ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {emails: ["suzuki@polito.it","toyota@polito.it"]},
    params:{name: ''}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.removeFromGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith({error :"Missing attributes in the params", refreshedTokenMessage: ""})
    

 
  })




  afterEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.findOne.mockClear()


  })  
})

describe("deleteUser", () => { 

  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
    
  });

  test("Should delete user  called by admin and delete the group ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {email: 'member1@example.com'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {email:"member1@example.com",role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
    let transaction_data ={deletedCount : 3}
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)

    jest.spyOn(User, "findOneAndDelete").mockResolvedValueOnce(user)
 
    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce(transaction_data) 
   



    jest.spyOn(Group, "findOne").mockResolvedValue(group) 
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteUser(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: { deletedTransactions: 3, deletedFromGroup: true }, refreshedTokenMessage: ""})

 
  })

  test("Should delete user  called by admin,no group ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {email: 'member1@example.com'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
    let transaction_data ={deletedCount : 3}
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)

    jest.spyOn(User, "findOneAndDelete").mockResolvedValueOnce(user)
 
    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce(transaction_data) 
   



    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteUser(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: { deletedTransactions: 3, deletedFromGroup: false }, refreshedTokenMessage: ""})

 
  })


  test("Should return error 401 if the admin is not authroized ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {email: 'test@test.it'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValueOnce(mockReq.body.name) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteUser(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
   

 
  })

  test("Should return error 400 if the user to delete does not exists", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {email: 'test@test.it'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValueOnce(mockReq.body.name) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteUser(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "User not found", refreshedTokenMessage: ""})
   

 
  })



  test("Catch Block Try", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.deleteUser(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

 
  })

})

describe("deleteGroup", () => {
  beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    User.prototype.save.mockClear()
    Group.prototype.save.mockClear()
    Group.findOne.mockClear() 
    Group.find.mockClear() 
    jest.restoreAllMocks()
    
  });


  test("Should remove  the group and display if called by admin ", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: 'TestGroup'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValueOnce(mockReq.body.name) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {message: "Group TestGroup has been deleted"}, refreshedTokenMessage: ""})

 
  })

  test("Should return error 401 if the admin is not authorized", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: 'TestGroup'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(usertoadd)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    

 
  })
  test("Should return error 400 if the groupname is missing", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": 'Missing attribute in the request body', refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if the groupname is empty", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: ''}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "The attribute in the request body is empty", refreshedTokenMessage: ""})

 
  })

  test("Should return error 400 if the grouptest does not exists", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: 'test'}

};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const usertoadd= {email :"toyota@polito.it", _id : 1};
  
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ], save: jest.fn() }
            

   
    const verify = jest.fn(()=> {return {flag:true}});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) 
   
    
    
    jest.spyOn(Group.prototype, 'save')
    .mockImplementationOnce(() => Promise.resolve(1))



  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": 'Group test does not exist', refreshedTokenMessage: ""})

 
  })
  test("Catch Block Try", async () => {
     
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      
    },
    body: {name: 'TestGroup'}
};
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        message: ""
      }
    };
    const user= {role :"Admin", username :"pinco"};
    const callingUser = {
      _id: 'mockUserId',
      refreshToken: "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'",
      username: 'mockUsername',
    };
   
    
    
    const group=  {name: 'Test Group', members: [ {email:'member1@example.com'}, {email: 'member2@example.com' } ] }
            


    const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
    utils.verifyAuth = verify;
     
    const groupname = jest.fn((groupname)=> {return groupname});
     utils.handleString = groupname;

 
    
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group) 
   
  
    
    await users.deleteGroup(mockReq, mockRes)
   

    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

 
  })


 


 })