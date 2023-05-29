import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import * as utils from "../controllers/utils.js";
/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear()
  User.findOne.mockClear()

  //additional `mockClear()` must be placed here
});

describe("getUsers", () => {

  test("should return error 401 if  called by an authenticated user who is not an admin", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    
    const verify = jest.fn(()=> {return {flag:false}});
    utils.verifyAuth = verify;

    jest.spyOn(User, "find").mockImplementation(() => [])
 


    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(401)

  })

 test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const verify = jest.fn(()=> {return true});
    utils.verifyAuth = verify;
    jest.spyOn(User, "find").mockImplementation(() => {return false})

    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(400)
    expect(response.body.data).toEqual([])
  })

  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const veriFy = jest.fn(()=> {return true});
    utils.verifyAuth = veriFy;


  

    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual(retrievedUsers)
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