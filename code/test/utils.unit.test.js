import * as utils from "../controllers/utils.js";
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken')
describe("handleDateFilterParams", () => { 
    test('Date Invalid Format', () => {
        const mockReq = {
        
            query: {
                date: "1",
                from: "",
                upTo: "",
            
          }}
      
        expect(() => utils.handleDateFilterParams(mockReq)).toThrow();
    });
    test('from Invalid Format', () => {
        const mockReq = {
        
            query: {
                date: "",
                from: "1",
                upTo: "",
            
          }}

        expect(() => utils.handleDateFilterParams(mockReq)).toThrow();
    });
    test('upto Invalid Format', () => {
        const mockReq = {
        
            query: {
                date: "",
                from: "",
                upTo: "1",
            
          }}
        

      
    
    
          


        expect(() => utils.handleDateFilterParams(mockReq)).toThrow();
    });

    test('Return object error if the query contains date from and upto all together', () => {
        const mockReq = {
        
            query: {
                date: "2023-04-30T00:00:00.000Z",
                from: "2023-04-30T00:00:00.000Z",
                upTo: "2023-04-30T00:00:00.000Z",
            
          }}
        

      expect(() => utils.handleDateFilterParams(mockReq)).toThrow();
    });

    test('Return query with date information', () => {
        const mockReq = {
        
            query: {
                date: "2023-04-30",
             
            
          }}
        let sdate=mockReq.query.date.split("-")

        expect(utils.handleDateFilterParams(mockReq,null)).toStrictEqual({'date': { $gte: new Date(Date.UTC(sdate[0], sdate[1]-1, sdate[2], 0, 0, 0)), $lte: new Date(Date.UTC(sdate[0], sdate[1]-1, sdate[2], 23, 59, 59)) } ,'flag': true});
    });

    test('Return query with from and upTo information', () => {
        const mockReq = {
        
            query: {
                from: "2023-04-30",
                upTo: "2023-05-30"
             
            
          }}
        let sfrom=mockReq.query.from.split("-")
        let sUpto=mockReq.query.upTo.split("-")

      expect(utils.handleDateFilterParams(mockReq,null)).toStrictEqual({'date': { $gte: new Date(Date.UTC(sfrom[0], sfrom[1]-1, sfrom[2], 0, 0, 0)), $lte: new Date(Date.UTC(sUpto[0], sUpto[1]-1, sUpto[2], 23, 59, 59)) } ,'flag': true});
    });
    test('Return query with from  information', () => {
        const mockReq = {
        
            query: {
                from: "2023-04-30"
               
             
            
          }}
        let sfrom=mockReq.query.from.split("-")
        

      expect(utils.handleDateFilterParams(mockReq,null)).toStrictEqual({'date': { $gte: new Date(Date.UTC(sfrom[0], sfrom[1]-1, sfrom[2], 0, 0, 0)) } ,'flag': true});
    });

    test('Return query with upTo information', () => {
        const mockReq = {
        
            query: {
               
                upTo: "2023-05-30"
             
            
          }}
        let sUpto=mockReq.query.upTo.split("-")

      expect(utils.handleDateFilterParams(mockReq,null)).toStrictEqual({"date": {$lte: new Date(Date.UTC(sUpto[0], sUpto[1]-1, sUpto[2], 23, 59, 59)) } ,'flag': true});
    });

    test('Return nothing is query is missing', () => {
        const mockReq = {
        
            query: {
               
                }}
      

      expect(utils.handleDateFilterParams(mockReq,null)).toStrictEqual({queryObj : { }  ,'flag': true});
    });

  
})

describe("handleNumber", () => { 


 
  test('should return the number if valid', () => {
    const result = utils.handleNumber(42, 'nameVar');
    expect(result).toBe(42);
  });

  test('should parse and return the number from a valid string', () => {
    const result = utils.handleNumber('3.14', 'nameVar');
    expect(result).toBe(3.14);
  });

  test('should handle comma as decimal separator in string input', () => {
    const result = utils.handleNumber('1000.25', 'nameVar');
    expect(result).toBe(1000.25);
  });

  test('should throw an error if the number is missing', () => {
    expect(() => {
      utils.handleNumber(undefined, 'nameVar');
    }).toThrow('Missing value: nameVar');
  });

  test('should throw an error if the input is not a number or string', () => {
    expect(() => {
      utils.handleNumber({}, 'nameVar');
    }).toThrow('Invalid format of nameVar');
  });

  test('should throw an error if the string input is in an invalid format', () => {
    expect(() => {
      utils.handleNumber('abc', 'nameVar');
    }).toThrow('Invalid format of nameVar');
  });












})
describe("verifyAuth", () => { 

    beforeEach(() => {
        jwt.verify.mockClear()
        jest.restoreAllMocks();
    });
      test('Catch Block try', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }

        jwt.verify.mockClear()
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["mario@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw {name: "Catch_Block Try"} })
    
    
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Catch_Block Try"});
    });
     
    test('Return flag to false and the message error if we mess the token in the headers', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }

       const info=0;

          utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Unauthorized: please add your token in the headers"});
    });


    test('Test verify with admin',async () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Admin"}
         const info={ authType: "Admin", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementation(() => { return decodedAccessToken })
          // utils.verifyAuth(mockReq,mockRes,info)
    
         

        
        expect(utils.verifyAuth(mockReq,mockRes,info)).toEqual({flag: true});
        
    });
     

    test('Return object error if the acces token are not associated with a user', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"",email :"mario@polito.it" , role: "Admin"}
         const info={ authType: "Admin", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementation(() => { return decodedAccessToken })
         


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Token is missing information"});
    });
    
    test('Return object error if the refresh token are not associated with a user', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"aziz",email :"mario@polito.it" , role: "Admin"}
         const decodedRefreshToken= {username:"",email :"mario@polito.it" , role: "Admin"}
         const info={ authType: "Admin", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Token is missing information"});
    });



    test('Test verify with Regular User', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User",username:"pippo", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementation(() => { return decodedAccessToken })
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: true});
    });


    test('Return object error if the refresh token give us different user information  against the acces token', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"not_pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User",username:"pippo", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Mismatched users"});
    });


    test('Return object error if the Tokens have a different username from the requested one,User control', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Tokens have a different username from the requested one"});
    });

    test('Return object error if you are trying admin authorization without having the permissions', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Admin",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "You are not an Admin"});
    });


    test('Return object error if Tokens have a different username from the requested one, test User/admin', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User/Admin",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Tokens have a different username from the requested one"});
    });


    test('Return object error if the email is not in the group', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["dottor@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Your email is not in the group"});
    });

    test('Return true if the access is granted for group authorization', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["mario@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedAccessToken })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: true});
    });



    //accesstoken expired
    test('access token expired Test verify with admin', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Admin"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Admin"}
         const info={ authType: "Admin", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
         


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: true});
    });
     

   

    test('access token expired Test verify with Regular User', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User",username:"pippo", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: true});
    });


    


    test('access token expired,Return object error if the Tokens have a different username from the requested one,User control', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Tokens have a different username from the requested one"});
    });

    test('access token expired,Return object error if you are trying admin authorization without having the permissions', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Admin",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "You are not an Admin"});
    });


    test('access token expired,Return object error if Tokens have a different username from the requested one, test User/admin', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "User/Admin",username:"topolino", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Tokens have a different username from the requested one"});
    });


    test('access token expired,Return object error if the email is not in the group', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["dottor@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
         jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          //utils.verifyAuth(mockReq,mockRes,info)


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Your email is not in the group"});
    });

  

    test('access token expired,Return true if the access is granted for group authorization', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["mario@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
       jest.spyOn(jwt, "verify").mockImplementationOnce(() => { return decodedRefreshToken })
       jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: true});
    });

    test('Return object error if the refresh token expired(need to perform login again)', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["mario@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
       jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Perform login again"});
    });


    test('access token expired,Catch Block try ', () => {
        const mockReq = {
        
            cookies: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTE5ODYzMH0.tCqmMl60NWG43bmi3aqZ4zNEPOuPZ_lyZG7g9CKxQV8",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"
            
          }}
          const mockRes = {
            cookie: jest.fn(),
            locals: {message: jest.fn()}
        }
         const decodedAccessToken= {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const decodedRefreshToken = {username:"pippo",email :"mario@polito.it" , role: "Regular"}
         const info={ authType: "Group",username:"pippo", emailList: ["mario@polito.it","mariolino@mariolone.it"], token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZ2Vsby5pYW5uaWVsbGk5OUBnbWFpbC5jb20iLCJpZCI6IjY0NjI2MjliNWYzZWU0NzVjNGI3NjJhMyIsInVzZXJuYW1lIjoiYW5nZWxvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUxOTg2MzAsImV4cCI6MTY4NTgwMzQzMH0.8KRWV60rOsVSM8haLIL3eplyZTelaxt5KQNkvUzv10Q"}
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "TokenExpiredError"}) })
         jest.spyOn(jwt, "verify").mockImplementationOnce(() => { throw ({name: "Catch_Block Try"}) })
       jest.spyOn(jwt, "sign").mockImplementationOnce(() => { return decodedAccessToken })
          


        expect(utils.verifyAuth(mockReq,mockRes,info)).toStrictEqual({flag: false, cause: "Catch_Block Try"});
    });
    

 


})

describe('isJsonString', () => {
  test('should return true for valid JSON string', () => {
    const jsonString = '{"key": "value"}';
    expect(utils.isJsonString(jsonString)).toBe(true);
  });

  test('should return false for invalid JSON string', () => {
    const invalidJsonString = '{"key": "value",}';
    expect(utils.isJsonString(invalidJsonString)).toBe(false);
  });


});

describe("handleAmountFilterParams", () => { 
    
    test('Return object error if the query contains date from and upto all together', () => {
        const mockReq = {
        
            query: {
                min: "1",
                max: "2",
                amount: "3",
            
          }}
        
      
        expect(() => utils.handleAmountFilterParams(mockReq)).toThrow()    
    });

    test('Return query with amount information', () => {
        const mockReq = {
        
            query: {
                amount: "2",
             
            
          }}
          const number = jest.fn((n)=> {return n});
          utils.handleNumber = number;
        

      expect(utils.handleAmountFilterParams(mockReq,null)).toStrictEqual({amount: { $eq: parseFloat(mockReq.query.amount) } , 'flag': true });
    });
    test('Return query with min information', () => {
        const mockReq = {
        
            query: {
                min: "2",
             
            
          }}
          const number = jest.fn((n)=> {return n});
          utils.handleNumber = number;
        

      expect(utils.handleAmountFilterParams(mockReq,null)).toStrictEqual({ amount: { $gte: parseFloat(mockReq.query.min) } , 'flag': true });
    });

    test('Return query with max information', () => {
        const mockReq = {
        
            query: {
                max: "2",
             
            
          }}
          const number = jest.fn((n)=> {return n});
          utils.handleNumber = number;
        

      expect(utils.handleAmountFilterParams(mockReq,null)).toStrictEqual({amount: { $lte: parseFloat(mockReq.query.max) } , 'flag': true });
    });

    test('Return query with max and min information', () => {
        const mockReq = {
        
            query: {
                max: "2",
                min: "1"
            
          }}
          const number = jest.fn((n)=> {return n});
          utils.handleNumber = number;
        

      expect(utils.handleAmountFilterParams(mockReq,null)).toStrictEqual({ amount: { $gte: parseFloat(mockReq.query.min) , $lte: parseFloat(mockReq.query.max) } , 'flag': true });
    });

   
  

    test('Return nothing is query is missing', () => {
        const mockReq = {
        
            query: {
               
                }}
      

      expect(utils.handleAmountFilterParams(mockReq,null)).toStrictEqual({queryObj : { }  ,'flag': true});
    });

  
})

describe("handleString", () => { 
    
   test('should return the trimmed lowercase string if valid', () => {
        const result = utils.handleString('   Example String   ', 'nameVar');
        expect(result).toBe('example string');
      });

      test('should throw an error if the input is not a string', () => {
        expect(() => {
          utils.handleString(123, 'nameVar');
        }).toThrow('Invalid format of nameVar');
      });

      test('should throw an error if the string is empty', () => {
        expect(() => {
          utils.handleString('', 'nameVar');
        }).toThrow('Empty string: nameVar');
      });
  
  
})




