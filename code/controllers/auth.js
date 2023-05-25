import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleString } from './utils.js';

/**
 *  Register a new user in the system
  - Request Body Content: An object having attributes `username`, `email` and `password` ???
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */

export const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        username = handleString(username, "username");
        const existingUser_email = await User.findOne({ email: req.body.email });
        if (existingUser_email) return res.status(400).json({ message: "Email already taken" });
        var myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
        if (!myRegEx.test(req.body.email)) return res.status(400).json({ message: "Email format is not correct" });
        const existingUser_username = await User.findOne({ username: req.body.username });
        if (existingUser_username) return res.status(400).json({ message: "Username already taken" });

        if (req.body.password.length < 8) return res.status(400).json({ message: "Password doesn't match constraints,requires at least 8 characters" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(200).json({
            data: 'User added succesfully',
            message: res.locals.message
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

/**
 * Register a new user in the system with an Admin role
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const registerAdmin = async (req, res) => {
    try {

        const authAdmin = verifyAuth(req, res, { authType: "Admin" });

        let { username, email, password } = req.body;
        username = handleString(username, "username");
        const existingUser_email = await User.findOne({ email: req.body.email });
        if (existingUser_email) return res.status(400).json({ message: "Email already taken" });
        var myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
        if (!myRegEx.test(req.body.email)) return res.status(400).json({ message: "Email format is not correct" });
        const existingUser_username = await User.findOne({ username: req.body.username });
        if (existingUser_username) return res.status(400).json({ message: "Username already taken" });

        if (req.body.password.length < 8) return res.status(400).json({ message: "Password doesn't match constraints,requires at least 8 characters" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        res.status(200).json({
            data: 'User added succesfully',
            message: res.locals.message
        });
    } catch (err) {
        res.status(500).json(err);
    }

}

/**
 * Perform login 
  - Request Body Content: An object having attributes `email` and `password`
  - Response `data` Content: An object with the created accessToken and refreshToken
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - error 400 is returned if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    const { email, password } = req.body
    const cookie = req.cookies
    const existingUser = await User.findOne({ email: email })
    if (!existingUser) return res.status(400).json('please you need to register')
    try {
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json('wrong credentials')
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
            message: res.locals.message })
    } catch (error) {
        res.status(400).json(error)
    }
}

/**
 * Perform logout
  - Auth type: Simple
  - Request Body Content: None
  - Response `data` Content: A message confirming successful logout
  - Optional behavior:
    - error 400 is returned if the user does not exist
 */
export const logout = async (req, res) => {
    try {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        if (verifyAuth(req, res, {authType: "User/Admin", username: user.username, token: user ? user.refreshToken : 0})) {
            user.refreshToken = null
            res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
            res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
            const savedUser = await user.save()
            res.status(200).json({
                data: 'Logged out', 
                message:res.locals.message
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}
