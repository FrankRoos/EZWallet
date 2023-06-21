import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model.js';
import { Group, User } from "../models/User.js";
import * as utils from "../controllers/utils.js";
import * as controller from "../controllers/controller.js"

jest.mock('../models/model');
jest.mock('../controllers/utils.js');

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();

  jest.restoreAllMocks();
});

describe("createCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food"
      }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)


    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attributes in the body", refreshedTokenMessage: mockRes.locals.message });

  })

  test("Should return a 400 error if at least one of the parameters in the request body is an empty string", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: ""
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)


    const type = jest.fn().mockImplementation(() => { throw new Error("Empty string: name") });
    utils.handleString = type;


    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Empty string: name", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: "green"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the type of category passed in the request body represents an already existing category in the database by type search", async () => {
    const category = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: 'food',
        color: 'blue',
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: "green"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValue(1)
      .mockReturnValueOnce(true)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce(category)
    //.mockReturnValueOnce([])

    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ type: mockReq.body.type })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Category type already exists", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the color of category passed in the request body represents an already existing category in the database by color search", async () => {
    const category = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: 'food',
        color: 'blue',
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: "green"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    //categories.prototype.save.mockResolvedValue(category);

    jest.spyOn(User, "findOne")
      .mockReturnValue(1)
      .mockReturnValueOnce(true)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    const type = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
    utils.handleString = type;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(category)


    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ color: mockReq.body.color })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Color already used", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should create a new category and return the saved data and a 200 success code", async () => {

    const category =
    {
      
      type: "food",
      color: "blue",
     
    }

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "travel",
        color: "black"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValue(1)
      .mockReturnValueOnce(true)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    const type = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
    utils.handleString = type;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])

    jest.spyOn(categories.prototype, "save").mockImplementation(() => { return Promise.resolve(category) })

    await controller.createCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: category, refreshedTokenMessage: mockRes.locals.message })
  })
})

describe("updateCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });

  test("Should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: "green"
      },
      params: { type: "food" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })


  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food"
      },
      params: { type: "food" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)


    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attributes in the body", refreshedTokenMessage: mockRes.locals.message });

  })


  test("should return a 400 error if at least one of the parameters in the request body is an empty string", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "",
        color: "green"
      },
      params: { type: "" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn().mockImplementation(() => { throw new Error("Empty string: type") });
    utils.handleString = handle_string;

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attributes in the body", refreshedTokenMessage: mockRes.locals.message });

  })

  test("should return a 404 error if the parameter is empty", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "type",
        color: "green"
      },
      params: { type: "" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn().mockImplementation(() => { throw new Error("Empty string: type") });
    utils.handleString = handle_string;

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Service Not Found. Reason: Empty string: type", refreshedTokenMessage: mockRes.locals.message });

  })

  test("should return a 400 error if the type of category passed as a route parameter does not represent a category in the database", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food",
        color: "green"
      },
      params: { type: "food" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.type)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce([])


    //const handle_string = jest.fn().mockImplementation(()=> {throw new Error("Empty string: type")});
    // utils.handleString = handle_string;

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ type: mockReq.params.type })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Category type does not exist in the database", refreshedTokenMessage: mockRes.locals.message });

  })


  test("Should return a 400 error if the type of category passed in the request body represents an already existing category in the database by color search", async () => {
    const category_params = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "food",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]

    const category_body = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food",
        color: "blue"
      },
      params: { type: "food" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValueOnce(mockReq.params.type)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
      .mockReturnValue(1)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce(category_params)
      .mockReturnValueOnce(category_body)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ color: mockReq.body.color })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Color already used by another catecory", refreshedTokenMessage: mockRes.locals.message });

  })

  test("Should return a 400 error if the type of category passed in the request body represents an already existing category in the database by color search", async () => {
    const category_params = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const category_body = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "food",
        color: "green",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "school",
        color: "green"
      },
      params: { type: "invest" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValueOnce(mockReq.params.type)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
      .mockReturnValue(1)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce(category_params)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(category_body)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ type: mockReq.body.type })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Category type in the body request already exists", refreshedTokenMessage: mockRes.locals.message });

  })


  test("Should return a 400 error if the type of category passed in the request body represents an already existing category in the database by color search", async () => {
    const category_params = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const category_body = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food",
        color: "blue"
      },
      params: { type: "invest" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValueOnce(mockReq.params.type)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
      .mockReturnValue(1)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValue(1)
      .mockReturnValueOnce(category_params)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(category_body)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({ type: mockReq.body.type })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Category type in the body request already exists", refreshedTokenMessage: mockRes.locals.message });

  })


  test("Should return a 200 code and a successful message for the edited category when body.type is different from the params.type", async () => {
    const category_params = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "food",
        color: "blue"
      },
      params: { type: "invest" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValueOnce(mockReq.params.type)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
      .mockReturnValue(1)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValueOnce(category_params)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValue(1)

    jest.spyOn(categories, "findOneAndUpdate")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    jest.spyOn(transactions, "updateMany")
      .mockReturnValueOnce({ modifiedCount: 2 })
      .mockReturnValue(1)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type })
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Category edited successfully", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });

  })

  test("Should return a 200 code and a successful message for the edited category when body.type is equal to params.type", async () => {
    const category_params = [
      {
        _id: "647888a2e87ff1b64165609d",
        type: "invest",
        color: "blue",
        date: "2023-06-01T12:01:38.709Z",
        __v: 0
      }
    ]

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {
        type: "invest",
        color: "green"
      },
      params: { type: "invest" }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValueOnce(mockReq.params.type)
      .mockReturnValueOnce(mockReq.body.type)
      .mockReturnValueOnce(mockReq.body.color)
      .mockReturnValue(1)
    utils.handleString = handle_string;

    jest.spyOn(categories, "find")
      .mockReturnValueOnce(category_params)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValue(1)

    jest.spyOn(categories, "findOneAndUpdate")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    jest.spyOn(transactions, "count")
      .mockReturnValueOnce(2)
      .mockReturnValue(1)

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(transactions.count).toHaveBeenCalledWith({ type: mockReq.params.type })
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Category edited successfully", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });

  })

  test("Should return a 400 error whether there are another error", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: {
        type: "food",
        color: "green"
      },
      params: { type: 2 }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const handle_string = jest.fn().mockImplementation(() => { throw new Error("Invalid format of: type") });
    utils.handleString = handle_string;

    await controller.updateCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(handle_string).toHaveBeenCalledWith(mockReq.params.type, "type")
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid format of: type", refreshedTokenMessage: mockRes.locals.message })

  })


})

describe("deleteCategory", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });
  test("Should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: { types: ["health", "food"] },
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })

  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: {}
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)


    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing attributes in the body", refreshedTokenMessage: mockRes.locals.message });

  })


  test("Should return a 400 error if at least one of the types in the array is an empty string", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { types: ["healt", ""] }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "There is an empty string in the category list", refreshedTokenMessage: mockRes.locals.message });

  })


  test("Should return a 400 error if at least one of the types in the array does not represent a category in the database", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { types: ["healt", 2] }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValue(1)

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.findOne).toHaveBeenCalledWith({ type: 2 })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "You inserted an invalid category", refreshedTokenMessage: mockRes.locals.message });

  })

  test("Should return a 200 successful code and a confirmsation of a successful deletion and an attribute `count` that specifies the number of transactions that have had their category type changed when N = T", async () => {
    const categor = [{ type: "food", color: "red" }, { type: "health", color: "green" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { types: ["health", "food"] }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(categor[0])

      .mockReturnValue(1)

    jest.spyOn(categories, "find")
      .mockImplementation(() => { return categor })


    jest.spyOn(transactions, "updateMany")
      .mockReturnValueOnce({ modifiedCount: 2 })
      .mockReturnValue(1)

    jest.spyOn(categories, "findOneAndDelete")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({})
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Categories deleted", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });

  })

  test("Should return a 200 successful code and a confirmsation of a successful deletion and an attribute `count` that specifies the number of transactions that have had their category type changed when N > T", async () => {
    const categor = [{ type: "food", color: "red" }, { type: "health", color: "green" }, { type: "school", color: "black" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { types: ["health", "food"] }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(categor[0])

      .mockReturnValue(1)

    jest.spyOn(categories, "find")
      .mockImplementation(() => { return categor })


    jest.spyOn(transactions, "updateMany")
      .mockReturnValueOnce({ modifiedCount: 2 })
      .mockReturnValue(1)

    jest.spyOn(categories, "findOneAndDelete")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({})
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Categories deleted", count: 2 }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });

  })

  test("Should return a 400 error if there is only 1 category in the database", async () => {
    const categor = [{ type: "food", color: "red" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { types: ["health", "food"] }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    };

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(categor[0])

      .mockReturnValue(1)

    jest.spyOn(categories, "find")
      .mockImplementation(() => { return categor })


    jest.spyOn(transactions, "updateMany")
      .mockReturnValueOnce({ modifiedCount: 2 })
      .mockReturnValue(1)

    jest.spyOn(categories, "findOneAndDelete")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    await controller.deleteCategory(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({})
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "There is only one category", refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });

  })

  test("Should return a 400 error whether there are another error", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      },
      body: { types: ["food"] }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    await controller.deleteCategory(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Operation `users.findOne()` buffering timed out after 10000ms", refreshedTokenMessage: mockRes.locals.message })

  })

})

describe("getCategories", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });
  test("Should return a 401 error if called by an authenticated user who is not an admin 1(authType = Admin)", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    await controller.getCategories(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 401 error if called by an authenticated user who is not an admin 2(authType = Admin)", async () => {
    const categor = []
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "find")
      .mockReturnValueOnce(categor)
      .mockReturnValue(1)

    await controller.getCategories(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({})
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "There are no categories", refreshedTokenMessage: mockRes.locals.message })

  })


  test("Should return all categories", async () => {
    const categor = [{ type: "food", color: "red" }, { type: "health", color: "green" }, { type: "school", color: "black" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"

      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(true)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(categories, "find")
      .mockReturnValueOnce(categor)
      .mockReturnValue(1)

    await controller.getCategories(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.find).toHaveBeenCalledWith({})
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: categor, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error whether there are another error", async () => {

    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    await controller.getCategories(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Operation `users.findOne()` buffering timed out after 10000ms", refreshedTokenMessage: mockRes.locals.message })

  })
})

describe("createTransaction", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });

  test("Should return a 400 error if the username passed as a route parameter is an empty string or is in an invalid format", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockImplementation(() => { throw new Error("Empty string: param-username") })
    utils.handleString = handle_string;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(handle_string).toHaveBeenCalledWith(mockReq.params.username, "param-username")
    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Service Not Found. Reason: Empty string: param-username", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 401 error if called by an authenticated user who is not the same user as the one in the route parameter", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.body.username)
    utils.handleString = handle_string;

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the username passed as a route parameter does not represent a user in the database", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce(null)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
    utils.handleString = handle_string;

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "User given as route request parameter not found", refreshedTokenMessage: mockRes.locals.message })

  })

  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
    utils.handleString = handle_string;

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;


    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Body does not contains all requested attributes", refreshedTokenMessage: mockRes.locals.message });

  })

  test("Should return a 400 error if at least one of the parameters in the request body is an empty string", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockImplementation(() => { throw new Error("Empty string: type") })
    utils.handleString = handle_string;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(handle_string).toHaveBeenCalledWith(mockReq.body.type, "type")
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Empty string: type", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: "10a", type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockResolvedValueOnce(mockReq.body.type)
    utils.handleString = handle_string;

    const handle_num = jest.fn()
      .mockImplementation(() => { throw new Error("Invalid format of amount") })
    utils.handleNumber = handle_num;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid format of amount", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the username passed in the request body does not represent a user in the database", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(null)
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockResolvedValueOnce(mockReq.body.type)
    utils.handleString = handle_string;

    const handle_num = jest.fn()
      .mockResolvedValueOnce(mockReq.body.amount)
    utils.handleNumber = handle_num;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "User given in body not found in the database", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the username passed in the request body is not equal to the one passed as a route parameter", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce({ _id: 124 })
      .mockReturnValueOnce({ _id: 123 })
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockResolvedValueOnce(mockReq.body.type)
    utils.handleString = handle_string;

    const handle_num = jest.fn()
      .mockResolvedValueOnce(mockReq.body.amount)
    utils.handleNumber = handle_num;

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username })
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "User in parameters and User in body are different", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 400 error if the type of category passed in the request body does not represent a category in the database", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce({ _id: 123 })
      .mockReturnValueOnce({ _id: 123 })
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockResolvedValueOnce(mockReq.body.type)
    utils.handleString = handle_string;

    const handle_num = jest.fn()
      .mockResolvedValueOnce(mockReq.body.amount)
    utils.handleNumber = handle_num;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(null)
      .mockReturnValue(1)

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(categories.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Category Not Found in the Database", refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should create a new transaction and return the saved data and a 200 success code", async () => {

    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const category =
    {
      _id: "647888a2e87ff1b64165609d",
      type: "food",
      color: "blue",
      date: "2023-06-01T12:01:38.709Z",
      __v: 0
    }
    const transaction = { username: "Mario", amount: 100, type: "food", date: "2023-06-01T12:01:38.709Z", }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
      body: { username: "Mario", amount: 100, type: "food" },
      params: { username: "Mario" }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }
    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValueOnce({ _id: 123 })
      .mockReturnValueOnce({ _id: 123 })
      .mockReturnValue(1)

    const handle_string = jest.fn()
      .mockReturnValue(1)
      .mockReturnValueOnce(mockReq.params.username)
      .mockReturnValueOnce(mockReq.body.username)
      .mockResolvedValueOnce(mockReq.body.type)
    utils.handleString = handle_string;

    const handle_num = jest.fn()
      .mockResolvedValueOnce(mockReq.body.amount)
    utils.handleNumber = handle_num;

    jest.spyOn(categories, "findOne")
      .mockReturnValueOnce(category)
      .mockReturnValue(1)

    jest.spyOn(transactions.prototype, "save").mockImplementation(() => { return Promise.resolve(transaction) })

    await controller.createTransaction(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: transaction, refreshedTokenMessage: mockRes.locals.message })

  })

})

describe("getAllTransactions", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  });
  test("Should return a 401 error if called by an authenticated user who is not the same user as the one in the route parameter", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: false } });
    utils.verifyAuth = verify;

    await controller.getAllTransactions(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: verify.cause, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Should return a 200 code and all Transaction", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }

    const all_transactions = [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: { color: "red" } },
    {  username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: { color: "green" } },
    { username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: { color: "red" } }]

    const all_transactions2 = [{  username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red" },
    {  username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green" },
    {  username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn()
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValue(1)

    const verify = jest.fn(() => { return { flag: true } });
    utils.verifyAuth = verify;

    jest.spyOn(transactions, "aggregate").mockImplementation(() => { return Promise.resolve(all_transactions) })

    await controller.getAllTransactions(mockReq, mockRes)
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken })
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: all_transactions2, refreshedTokenMessage: mockRes.locals.message })

  })

  test("Catch Block Try", async () => {
    const user = {
      username: "admin",
      email: "admin@admin.cm",
      password: "adminadmin",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Admin"
    }

    const all_transactions = [{ _id: 1, username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: { color: "red" } },
    { _id: 2, username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: { color: "green" } },
    { _id: 2, username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: { color: "red" } }]

    const all_transactions2 = [{ _id: 1, username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red" },
    { _id: 2, username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green" },
    { _id: 2, username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red" }]
    const mockReq = {
      cookies: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
      },
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {message: ""}
    }

    jest.spyOn(User, "findOne")
      .mockReturnValueOnce(user)
      .mockReturnValue(1)

      const verify = jest.fn(()=> {throw new Error("Catch Block Try")});
      utils.verifyAuth = verify;

    jest.spyOn(transactions, "aggregate").mockImplementation(() => { return Promise.resolve(all_transactions) })

    await controller.getAllTransactions(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({"error": "Catch Block Try", refreshedTokenMessage: ""})

  })
})

describe("getTransactionsByUser", () => {
  test('Should return the list of transaction of the user, without filters', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
       username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
       username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test('Should return the list of transaction of the user, with amount filter', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
       username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
       username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {'amount': { $eq: 100 } } } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test('Should return the list of transaction of the user, with min & max filters', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {$gte: 50, $lte: 150 } } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test('Should return the list of transaction of the user, with date filter', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
       username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: { date: { $eq: '2023-05-27T15:00:00.000+00:00' }} } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test('Error on date format filters', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': false, error: 'Invalid format of date parameter' } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid format of date parameter',
      refreshedTokenMessage: undefined
    })
  });

  test('Amount use together with min and max', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })
    utils.handleDateFilterParams = jest.fn().mockImplementation(() => { return { 'flag': true, queryObj: {} } })
    utils.handleAmountFilterParams = jest.fn().mockImplementation(() => { return { 'flag': false, error: "Cannot use 'amount' together with 'min' or 'max" } })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Cannot use 'amount' together with 'min' or 'max",
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter username doesn't represent any user", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "user",
        category: "example"
      },
      url: 'users/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => { return Promise.resolve(user) })
      .mockImplementationOnce(() => { return Promise.resolve(false) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found",
      refreshedTokenMessage: undefined
    })
  });

  test("Not an admin", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: '/transactions/users/user'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const admin = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => { return Promise.resolve(admin) })
      .mockImplementationOnce(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "You are not an Admin"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You are not an Admin",
      refreshedTokenMessage: undefined
    })
  });

  test("Username is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: username",
      refreshedTokenMessage: undefined
    })
  });

  test("Username has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of username",
      refreshedTokenMessage: undefined
    })
  });

})

//--------------------------------

describe("getTransactionsByUserByCategory", () => {
  test('Should return the list of transaction of the user, filtered by category', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'users/transactions/categories/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter username doesn't represent any user", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "user",
        category: "example"
      },
      url: 'users/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => { return Promise.resolve(user) })
      .mockImplementationOnce(() => { return Promise.resolve(false) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found",
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter category doesn't represent any category in DB", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(false) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Category not found",
      refreshedTokenMessage: undefined
    })
  });

  test("Not an admin", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: '/transactions/users/user/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const admin = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => { return Promise.resolve(admin) })
      .mockImplementationOnce(() => { return Promise.resolve(true) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "You are not an Admin"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You are not an Admin",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of category is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string) => { return string })
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: category",
      refreshedTokenMessage: undefined
    })
  });

  test("Username is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: username",
      refreshedTokenMessage: undefined
    })
  });

  test("Username has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of username",
      refreshedTokenMessage: undefined
    })
  });

  test("Category has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user",
        category: "example"
      },
      url: 'user/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string) => { return string })
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })

    await controller.getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of category",
      refreshedTokenMessage: undefined
    })
  });
})

//-------------------------

describe("getTransactionsByGroup", () => {
  test('Should return the list of transaction of the group', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
       username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
       username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter name doesn't represent any group", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve(false) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Group not found",
      refreshedTokenMessage: undefined
    })
  });

  test("User not in group", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const user1 = {
      username: "user1",
      email: "user1@gmail.com",
      password: "12345678",
      refreshToken: "ejJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user1] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "Your email is not in the group"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Your email is not in the group",
      refreshedTokenMessage: undefined
    })
  });

  test("Not an admin", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/transactions/groups/group/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const admin = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(admin) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "You are not an Admin"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You are not an Admin",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of group is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: name",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of group has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of name",
      refreshedTokenMessage: undefined
    })
  });

})
//------------------------------------------------------
describe("getTransactionsByGroupByCategory", () => {
  test('Should return the list of transaction of the group, filtered by category', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
       username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
       username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: listExpTransact,
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter name doesn't represent any group", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve(false) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Group not found",
      refreshedTokenMessage: undefined
    })
  });

  test("Parameter category doesn't represent any category in DB", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(false) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Category not found",
      refreshedTokenMessage: undefined
    })
  });

  test("User not in group", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const user1 = {
      username: "user1",
      email: "user1@gmail.com",
      password: "12345678",
      refreshToken: "ejJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    /*const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]*/

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user1] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "Your email is not in the group"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Your email is not in the group",
      refreshedTokenMessage: undefined
    })
  });

  test("Not an admin", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/transactions/groups/group/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const admin = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(admin) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(false) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "You are not an Admin"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You are not an Admin",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of category is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string) => { return string })
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: category",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of group is empty", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Empty string: " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: name",
      refreshedTokenMessage: undefined
    })
  });

  test("Name of group has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })
      .mockImplementationOnce((string) => { return string })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of name",
      refreshedTokenMessage: undefined
    })
  });

  test("Category has invalid format", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        name: "group",
        category: "example"
      },
      url: '/groups/group/transactions/category/example'
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    const listTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", categories_info: { color: "yellow" }, date: '2023-05-27T15:29:01.845+00:00'
    }]
    const listExpTransact = [{
      _id: '1', username: 'user', amount: 100, type: "example", color: "yellow", date: '2023-05-27T15:29:01.845+00:00'
    }]

    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { return Promise.resolve(user) }) 
    jest.spyOn(Group, 'findOne').mockImplementation(() => { return Promise.resolve({ members: [user] }) })
    jest.spyOn(categories, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'aggregate').mockImplementation(() => { return Promise.resolve(listTransact) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn()
      .mockImplementationOnce((string) => { return string })
      .mockImplementationOnce((string, nameVar) => { throw new Error("Invalid format of " + nameVar) })

    await controller.getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of category",
      refreshedTokenMessage: undefined
    })
  });

})

describe("deleteTransaction", () => {
  test('Should return the message that transaction is been deleted successfully', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve({username: user.username}) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: { message: "Transaction deleted" },
      refreshedTokenMessage: undefined
    })
  });

  test('Should return a 400 error if you are trying to delete a category that is not yours', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve({username: "not_user"}) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "Not authorized: transaction of another user",
      refreshedTokenMessage: undefined
    })
  });


  test("The request body doesn't contain all attributes", async () => {

    const body = {
      // "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing id",
      refreshedTokenMessage: undefined
    })
  });

  test("The id parameter is an empty string", async () => {

    const body = {
      "_id": ""
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing id",
      refreshedTokenMessage: undefined
    })
  });

  test("The username passed as parameter is not in the DB", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    
    jest.spyOn(User, 'findOne') //.mockReset()
      .mockImplementationOnce(() => { return Promise.resolve(user) })
      .mockImplementationOnce(() => { return Promise.resolve(false) })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found",
      refreshedTokenMessage: undefined
    })
  });

  test("Id doesn't represent transaction in the DB", async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }
    
    jest.spyOn(User, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(false) })
    //jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Transaction not found",
      refreshedTokenMessage: undefined
    })
  });

  test('User is not the same as that one requested', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "Tokens have a different username from the requested one"})
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Tokens have a different username from the requested one",
      refreshedTokenMessage: undefined
    })
  });

  test('Username is an empty string', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string, nameVar) => {  throw new Error("Empty string: " + nameVar) })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Service Not Found. Reason: Empty string: username",
      refreshedTokenMessage: undefined
    })
  });

  test('Username invalid format', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c8"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string, nameVar) => {  throw new Error("Invalid format of " + nameVar) })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid format of username",
      refreshedTokenMessage: undefined
    })
  });

  test('Wrong ID format', async () => {

    const body = {
      "_id": "64721f4d45fc5a2060f6b3c"
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q'
      },
      body: body,
      params: {
        username: "user"
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "user",
      email: "user@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q",
      role: "Regular"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findOne').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteOne').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)
    utils.handleString = jest.fn().mockImplementation((string) => { return string })

    await controller.deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid ID",
      refreshedTokenMessage: undefined
    })
  });


})

describe("deleteTransactions", () => {
  test('Should return the list of transactions deleted successfully', async () => {

    const body = {
      "_ids": ["647221a3bbae6d3b8b0d2105", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: { message: "Transactions deleted" },
      refreshedTokenMessage: undefined
    })
  });

  test("The request body doesn't contain all attributes", async () => {
    const body = {
      // "_ids": ["647221a3bbae6d3b8b0d2105", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing ids",
      refreshedTokenMessage: undefined
    })
  })

  test("The request body contains at least one empty string", async () => {
    const body = {
      "_ids": ["", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById').mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You inserted an empty string as Id",
      refreshedTokenMessage: undefined
    })
  })

  test("The request body contains at least one id that doesn't represent a transaction", async () => {
    const body = {
      "_ids": ["647221a3bbae6d3b8b0d2101", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById')
      .mockImplementationOnce(() => { return Promise.resolve(false) })
      .mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "One or more Transactions not found",
      refreshedTokenMessage: undefined
    })
  })

  test("Not an admin", async () => {
    const body = {
      "_ids": ["647221a3bbae6d3b8b0d2101", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById')
      .mockImplementationOnce(() => { return Promise.resolve(false) })
      .mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue({flag: false, cause: "You are not an Admin"})

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "You are not an Admin",
      refreshedTokenMessage: undefined
    })
  })

  test("Ids have a wrong format", async () => {
    const body = {
      "_ids": ["647221a3bbae6d3b8b0d21", "64721f4d45fc5a2060f6b3c8"]
    }
    const mockReq = {
      cookies: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NTc5MTMwM30.S48LU8cLrF1kiELJ2aL5qGvvWFmEom4rq0D6UHuSob0',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk'
      },
      body: body
    }
    const mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: undefined }
    }
    const user = {
      username: "admin",
      email: "admin@gmail.com",
      password: "12345678",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbUBnbWFpbC5jb20iLCJpZCI6IjY0NjI3OGEwYjAzMTA1ZGRhYTcwZWIzYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU3ODc3MDMsImV4cCI6MTY4NjM5MjUwM30.wKDfk71q1bciCZELPvxSDFh4NzY1KF_nIqN4SEcsDwk",
      role: "Admin"
    }

    jest.spyOn(User, 'findOne').mockImplementation(() => { return user })
    jest.spyOn(transactions, 'findById')
      .mockImplementation(() => { return Promise.resolve(true) })
    jest.spyOn(transactions, 'deleteMany').mockImplementation(() => { return Promise.resolve(true) })
    utils.verifyAuth = jest.fn().mockReturnValue(true)

    await controller.deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid ID",
      refreshedTokenMessage: undefined
    })
  })

})
