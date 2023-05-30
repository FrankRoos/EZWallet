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
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const veriFy = jest.fn(()=> {return true});
    utils.verifyAuth = veriFy;


  
    await users.getUsers(mockReq, mockRes)
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: retrievedUsers, refreshedTokenMessage: ""})
    
  })
})




describe("getUser", () => {

  test("Should return the user's data given by the parameter", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const retrievedUser = {  email: 'test1@example.com', password: 'hashedPassword1', username: 'test1',}
    const verify = jest.fn(()=> {return true});
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne").mockImplementation(() => {return retrievedUser})
     
    


    const response = await request(app)
      .get("/api/users/"+ retrievedUser.username)
      

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual(retrievedUser)

  })






 })

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })