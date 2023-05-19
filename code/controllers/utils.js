import jwt from 'jsonwebtoken'
import { get } from 'mongoose'
import { removeAllListeners } from 'nodemon'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
    const {date,from, upTo}=req.query 
try{

    if (date && (from|| upTo))
    throw  new Error("Cannot use 'date' together with 'from' or 'Upto")
  

    if (date)
    return {date: {$eq:  from}} 
    if (from)  
    return {date: {$gte:  from}} 
    if (upTo) 
     return {date: {$lte:  upTo}} 


     if (from && upTo)  
     return {date: {$gte: from , $lte: upTo}}


     return {};


}catch(error)
{
    if(error.message==="Cannot use 'date' together with 'from' or 'Upto")
      res.status(401).json(error.message)
    else
      res.status(400).json({error: error.message})

}


}

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken && !cookie.refreshToken) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            res.status(401).json({ message: "Token is missing information" })
            return false
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            res.status(401).json({ message: "Token is missing information" })
            return false
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            res.status(401).json({ message: "Mismatched users" });
            return false;
        }
        if(info.authType === "User" && decodedAccessToken.username !== info.username) {
            res.status(401).json({ message: "Tokens have a different username from the requested one" });
            return false;
        }
        if(info.authType === "Admin" && decodedAccessToken.role !== "Admin") {
            res.status(401).json({ message: "You are not an Admin" });
            return false;
        }
        if(info.authType === "Group" && info.emailList.includes(decodedAccessToken.email)) {
            res.status(401).json({ message: "Your email is not the group" });
            return false;
        }
        
        return true
    } catch (err) {
        if (err.name === "TokenExpiredError" || !cookie.accessToken) {
            try {
                const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                const newAccessToken = jwt.sign({
                    username: decodedRefreshToken.username,
                    email: decodedRefreshToken.email,
                    id: decodedRefreshToken.id,
                    role: decodedRefreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.message = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
                
                if(info.authType === "User" && decodedRefreshToken.username !== info.username) {
                    res.status(401).json({ message: "Tokens have a different username from the requested one" });
                    return false;
                }
                if(info.authType === "Admin" && decodedRefreshToken.role !== "Admin") {
                    res.status(401).json({ message: "You are not an Admin" });
                    return false;
                }
                if(info.authType === "Group" && !info.emailList.includes(decodedRefreshToken.email)) {
                    res.status(401).json({ message: "Your email is not the group" });
                    return false;
                }

                return true
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    res.status(401).json({ message: "Perform login again" });
                } else {
                    res.status(401).json({ message: err.name });
                }
                return false;
            }
        } else {
            res.status(401).json({ message: err.name });
            return false;
        }
    }
}

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
}