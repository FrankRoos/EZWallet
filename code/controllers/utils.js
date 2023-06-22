import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req, res) => {
    let { date, from, upTo } = req.query
    const regEx = /((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/
    try {
    if(date && !regEx.test(date))
        throw new Error("Invalid format of date parameter")
    if(from && !regEx.test(from))
        throw new Error("Invalid format of from parameter")
    if(upTo && !regEx.test(upTo))
        throw new Error("Invalid format of upTo parameter")

    

        if (date && (from || upTo))
            throw new Error("Cannot use 'date' together with 'from' or 'Upto")
          
        // Date constructor works with indexes, so months start from 0 
        if (date){
            date=date.split("-");
             return { 'date': { $gte: new Date(Date.UTC(date[0], date[1]-1, date[2], 0, 0, 0)), $lte: new Date(Date.UTC(date[0], date[1]-1, date[2], 23, 59, 59)) } ,'flag': true} }
        if (from && upTo) {
            from=from.split("-");
            upTo=upTo.split("-");
            return { 'date': { $gte: new Date(Date.UTC(from[0], from[1]-1, from[2], 0, 0, 0)), $lte: new Date(Date.UTC(upTo[0], upTo[1]-1, upTo[2], 23, 59, 59)) } ,'flag': true}}
        if (from) {
            from=from.split("-");
            return { 'date': { $gte: new Date(Date.UTC(from[0], from[1]-1, from[2], 0, 0, 0)) } ,'flag': true}}
        if (upTo){
             upTo=upTo.split("-");
            return {'date': { $lte: new Date(Date.UTC(upTo[0], upTo[1]-1, upTo[2], 23, 59, 59)) },'flag': true} }
    
        return  { queryObj : {},'flag': true};


    } catch (error) {  
        throw new Error({ 'flag': false, error: error.message})

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
export const verifyAuth  =(req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        //res.status(401).json({ message: "Unauthorized" });
        return {flag: false, cause: "Unauthorized: please add your token in the headers"};
    }
    try {
        const decodedAccessToken =  jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            //res.status(401).json({ message: "Token is missing information" })
            return {flag: false, cause: "Token is missing information"}
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            //res.status(401).json({ message: "Token is missing information" })
            return {flag: false, cause: "Token is missing information"}
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            //res.status(401).json({ message: "Mismatched users" });
            return {flag: false, cause: "Mismatched users"};
        }
        if (info.authType === "User" && decodedAccessToken.username !== info.username) {
            //res.status(401).json({ message: "Tokens have a different username from the requested one" });
            return {flag: false, cause: "Tokens have a different username from the requested one"};
        }
        if (info.authType === "Admin" && decodedAccessToken.role !== "Admin") {
            //res.status(401).json({ message: "You are not an Admin" });
            return {flag: false, cause: "You are not an Admin"};
        }
        if (info.authType === "User/Admin" &&  (decodedAccessToken.role !== "Admin" && decodedAccessToken.username !== info.username)){
            //res.status(401).json({ message: "Tokens have a different username from the requested one" });
            return {flag: false, cause: "Tokens have a different username from the requested one"};
        }  
        if (info.authType === "Group" && (info.emailList || info.members)) {
            if(info.members) info.emailList = [...info.members]
            const userHasAccess = info.emailList.some(x => x === decodedAccessToken.email);
            if (!userHasAccess) {
                //res.status(401).json({ message: "Your email is not in the group" });
                return {flag: false, cause: "Your email is not in the group"};
            }
        }
        return {flag: true}
    } catch (err) {
        let tokenrefresh=false
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
              

                if (info.authType === "User" && decodedRefreshToken.username !== info.username) {
                    // res.status(401).json({ message: "Tokens have a different username from the requested one" });
                    return {flag: false, cause: "Tokens have a different username from the requested one"};
                }
                if (info.authType === "Admin" && decodedRefreshToken.role !== "Admin") {
                    // res.status(401).json({ message: "You are not an Admin" });
                    return {flag: false, cause: "You are not an Admin"};
                }
                if(info.authType === "User/Admin" && decodedRefreshToken.role !== "Admin" && decodedRefreshToken.username !== info.username){
                        // res.status(401).json({ message: "Tokens have a different username from the requested one" });
                        return {flag: false, cause: "Tokens have a different username from the requested one"};
                    }               
                if (info.authType === "Group" && (info.emailList || info.members)) {
                    if(info.members) info.emailList = [...info.members]
                    const userHasAccess = info.emailList.some(x => x === decodedRefreshToken.email);
                    if (!userHasAccess) {
                        // res.status(401).json({ message: "Your email is not in the group" });
                        return {flag: false, cause: "Your email is not in the group"};
                    }
                }

                return {flag: true}

                
           
         
            } catch (err) {
                if (err.name === "TokenExpiredError") {

                    // res.status(401).json({ message: "Perform login again" });
                    return {flag: false, cause: "Perform login again"}
                } else {
                    // res.status(401).json({ message: err.name });
                    return {flag: false, cause: err.name}
                }
                // return false;
            }
        } else {
            // res.status(401).json({ message: err.name });
            // return false;
            return {flag: false, cause: err.name}
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
export const handleAmountFilterParams = (req, res) => {
    let { amount, min, max } = req.query
    try {

        if (amount && (min || max))
            throw new Error("Cannot use 'amount' together with 'min' or 'max")

        if (amount) {
            amount = handleNumber(amount);
            return {'amount': { $eq: parseFloat(amount) },  'flag': true }
        }
           
        if (min && max) {
            min = handleNumber(min);
            max = handleNumber(max);
            return {'amount': { $gte: parseFloat(min), $lte: parseFloat(max) } ,  'flag': true }
        }
            
        if (min) {
            min = handleNumber(min);
            return {'amount': { $gte: parseFloat(min) } , 'flag': true }
        }
            
        if (max) {
            max = handleNumber(max);
            return {'amount': { $lte: parseFloat(max) } , 'flag': true }
        }
           
    
        return { 'flag': true, queryObj: {} };

    } catch (error) {
        throw new Error({'flag': false, error: error.message})

    }
}

export const handleString = (string, nameVar) => {
    if(typeof(string)==="string")
    {
    string = string.trim();
     if(!string)
     {
        throw new Error("Empty string: " + nameVar)
     }
     else{
             string=string.toLowerCase()
            return string
        }
    }
    else if(typeof(string) !="string" ) 
        throw new Error("Invalid format of " + nameVar) 
   
    }



export const handleNumber = (number, nameVar) => {
    
     if(!number)
        throw new Error("Missing value: " + nameVar)
    if(typeof(number)!=="number" && typeof(number)!=="string")
        throw new Error("Invalid format of " + nameVar)
    if(typeof(number)==="string")
        number = number.replace(",", ".")
    try{
        number = Number(number)
        if (!number && number!=0) {throw new Error("Invalid format of " + nameVar) }
        return number
    }
    catch{
        throw new Error("Invalid format of " + nameVar)
    }


}

export const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}