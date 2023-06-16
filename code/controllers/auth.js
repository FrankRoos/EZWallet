import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleString, isJsonString } from './utils.js';

/**
 *  Register a new user in the system
  - Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "Mario", email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the username in the request body identifies an already existing user
- Returns a 400 error if the email in the request body identifies an already existing user
 */

export const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if ((!email && email !== "") || (!password && password !== "") || (!username && username !== ""))
            return res.status(400).json({ error: "Missing Parameters" });
        if (username === "" || password === "" || email === '')
            return res.status(400).json({ error: "A parameter is empty" });
        username = handleString(username, "username");
        const existingUser_email = await User.findOne({ email: req.body.email });
        if (existingUser_email) return res.status(400).json({ error: "Email already taken" });
        var myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
        if (!myRegEx.test(req.body.email))
            return res.status(400).json({ error: "Email format is not correct" });
        const existingUser_username = await User.findOne({ username: req.body.username });
        if (existingUser_username)
            return res.status(400).json({ error: "Username already taken" });

       // if (req.body.password.length < 8)
        //    return res.status(400).json({ error: "Password doesn't match constraints,requires at least 8 characters" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(200).json({
            data: { message: 'User added succesfully' },
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

/**
 * Register a new user in the system with an Admin role
- Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "admin", email: "admin@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the username in the request body identifies an already existing user
- Returns a 400 error if the email in the request body identifies an already existing user  
*/
export const registerAdmin = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if ((!email && email !== "") || (!password && password !== "") || (!username && username !== ""))
            return res.status(400).json({ error: "Missing Parameters" });
        if (username === "" || password === "" || email === '')
            return res.status(400).json({ error: "A parameter is empty" });
        username = handleString(username, "username");
        const existingUser_email = await User.findOne({ email: req.body.email });
        if (existingUser_email) return res.status(400).json({ error: "Email already taken" });
        var myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
        if (!myRegEx.test(req.body.email))
            return res.status(400).json({ error: "Email format is not correct" });
        const existingUser_username = await User.findOne({ username: req.body.username });
        if (existingUser_username) return res.status(400).json({ error: "Username already taken" });

        //if (req.body.password.length < 8) return res.status(400).json({ error: "Password doesn't match constraints,requires at least 8 characters" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        res.status(200).json({
            data: { message: 'Admin added succesfully' },

        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }

}

/**
 * Perform login 
  - Request Parameters: None
- Request Body Content: An object having attributes `email` and `password`
  - Example: `{email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: An object with the created accessToken and refreshToken
  - Example: `res.status(200).json({data: {accessToken: accessToken, refreshToken: refreshToken}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the email in the request body does not identify a user in the database
- Returns a 400 error if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    const { email, password } = req.body
    if ((!email && email !== "") || (!password && password !== ""))
        return res.status(400).json({ error: "Missing Parameters" });
    if (password === "" || email === '')
        return res.status(400).json({ error: "A parameter is empty" });
    var myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
    if (!myRegEx.test(req.body.email))
        return res.status(400).json({ error: "Email format is not correct" });
    const existingUser = await User.findOne({ email: email })
    if (!existingUser) return res.status(400).json({ error: 'please you need to register' })
    try {
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json({ error: 'wrong password' })
        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save()
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json({
            data: { accessToken: accessToken, refreshToken: refreshToken },
        })
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
}

/**
 * Perform logout
  - Request Parameters: None
- Request Body Content: None
- Response `data` Content: A message confirming successful logout
  - Example: `res.status(200).json({data: {message: "User logged out"}})`
- Returns a 400 error if the request does not have a refresh token in the cookies
- Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database

 */
export const logout = async (req, res) => {
    try {
        if (!req.cookies.refreshToken)
            return res.status(400).json({ error: "Missing refresh token in cookies" });

        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        if (!user) return res.status(400).json({ error: 'user not found' })

        const verify = verifyAuth(req, res, { token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })

        user.refreshToken = null
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        const savedUser = await user.save()
        res.status(200).json({ data: { message: "User logged out" } })
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
}
