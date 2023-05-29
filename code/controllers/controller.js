import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth, handleNumber, handleString } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })

        const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        let { type, color } = req.body;

        if (!type || !color)
            return res.status(401).json({
                error: "Missing attributes in the body",
                refreshedTokenMessage: res.locals.message
            })
        /*if (color === "") return res.status(401).json({ message: "Missing Color" })
        if (type === "") return res.status(401).json({ message: "Missing Type" })*/
        type = handleString(type, "type")
        color = handleString(color, "color")

        let find_bytype = await categories.find({ type: type });
        let category_found = find_bytype.map(v => Object.assign({}, { type: v.type, color: v.color }))
        if (category_found[0]) return res.status(401).json({
            error: "Category type already exists",
            refreshedTokenMessage: res.locals.message
        })

        let find_bycolor = await categories.find({ color: color });
        let color_found = find_bycolor.map(v => Object.assign({}, { type: v.type, color: v.color }))
        if (color_found[0]) return res.status(401).json({
            error: "Color already used",
            refreshedTokenMessage: res.locals.message
        })

        const new_categories = new categories({ type, color });
        new_categories.save()
            .catch(err => { throw err })
        return res.status(200).json({
            data: new_categories,
            message: res.locals.message
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
            refreshedTokenMessage: res.locals.message
        })
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        //{type:new color:new}
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })

        const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        let old_type = handleString(req.params.type, "type");
        let old_color_find = await categories.find({ type: old_type });
        if (!old_color_find.length)
            return res.status(401).json({
                error: "Category type does not exist in the database",
                refreshedTokenMessage: res.locals.message
            })

        let { type, color } = req.body;

        if (!type || !color)
            return res.status(401).json({
                error: "Missing attributes in the body",
                refreshedTokenMessage: res.locals.message
            })

        type = handleString(type, "type")
        color = handleString(color, "color")


        let find_bycolor = await categories.find({ color: color });
        let color_found = find_bycolor.map(v => Object.assign({}, { type: v.type, color: v.color }))
        if (color_found[0] && old_type === type && color_found[0].type !== type)
            return res.status(401).json({
                error: "Color already used",
                refreshedTokenMessage: res.locals.message
            })

        if (old_type != type) {
            let find_bytype = await categories.find({ type: type });
            let category_found = find_bytype.map(v => Object.assign({}, { type: v.type, color: v.color }))
            if (category_found[0])
                return res.status(401).json({
                    error: "Category type already exists",
                    refreshedTokenMessage: res.locals.message
                })
            //check sul colore nuovo 
            let find_bycolor = await categories.find({ color: color });
            let color_found = find_bycolor.map(v => Object.assign({}, { type: v.type, color: v.color }))

            let old_color_found = old_color_find.map(v => Object.assign({}, { type: v.type, color: v.color }))
            let old_color = old_color_found[0].color;
            if (color_found[0] && old_color != color)
                return res.status(401).json({
                    error: "Color already used",
                    refreshedTokenMessage: res.locals.message
                })

        }
        //found by type 
        let update = await categories.findOneAndUpdate({ type: old_type }, { type: type, color: color })
        let data = { message: "Category updated successfully" };

        //da sistemare count-->> vedi descrizione funzione
        if (old_type != type) {
            const transactionsList = await transactions.updateMany({ type: old_type }, { type: type });
            data.count = transactionsList.modifiedCount;
        }
        else {
            let num = await transactions.count({ type: old_type });
            data.count = num;
        }

        res.status(200).json({
            data: data,
            refreshedTokenMessage: res.locals.message
        });

    } catch (error) {
        if (error.message === "Empty string: type")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({
                error: error.message,
                refreshedTokenMessage: res.locals.message
            })
    }

}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })

        const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        const array_category = req.body.types
        if (!array_category) return res.status(401).json({ error: "Missing body", refreshedTokenMessage: res.locals.message })
        //check categories
        for (let category of array_category) {
            if (category === "")
                return res.status(400).json({ error: "Category is an empty string ", refreshedTokenMessage: res.locals.message })
            let check_exist = await categories.findOne({ type: category });
            if (!check_exist)
                return res.status(400).json({ error: "You inserted an invalid category", refreshedTokenMessage: res.locals.message })
        }

        let n_category = await categories.find({});
        let defaultCat = {};
        if (n_category.length == array_category.length)
            defaultCat = await categories.findOne({ sort: { 'created_at': 1 } })
        else
            defaultCat = await categories.findOne({ type: { $nin: array_category } }).sort({ 'created_at': 1 })

        let data = { message: "Success", count: 0 }
        let counter = 0;
        //delete categories
        for (let category of array_category) {
            if (category != defaultCat.type) {
                let find_transaction = await transactions.updateMany({ type: category }, { type: defaultCat.type })
                counter += find_transaction.modifiedCount
                let find_delete = await categories.findOneAndDelete({ type: category });
            }
        }
        data.count = counter

        //da sistemare la parte sulle transaction 

        res.json({ data: data, refreshedTokenMessage: res.locals.message })

    } catch (error) {
        res.status(400).json({ error: error.message, refreshedTokenMessage: res.locals.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })

        const verify = verifyAuth(req, res, { authType: "User/Admin", username: user.username, token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        let data = await categories.find({})

        if (!data)
            return res.json([])  //if no categories

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))


        return res.status(200).json({
            data: filter,
            refreshedTokenMessage: res.locals.message
        })

    } catch (error) {
        res.status(400).json({ error: error.message, refreshedTokenMessage: res.locals.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        let info = { authType: "User/Admin", username: req.params.username, token: user ? user.refreshToken : 0 }
        info.username = handleString(info.username, "param-username")

        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        let param_user = await User.findOne({ username: info.username })
        if (!param_user)
            throw new Error("User given in param  not found")

        let { username, amount, type } = req.body;
        if (!username || !amount || !type)
            throw new Error("Body does not contains all requested attributes")
        username = handleString(username, "username")
        type = handleString(type, "type")
        amount = handleNumber(amount, "amount")

        let body_user = await User.findOne({ username: username })
        if (!body_user)
            throw new Error("User given in body not found")

        if (body_user._id.toString() != param_user._id.toString())
            throw new Error("User in parameters and User in body are different")

        const category = await categories.findOne({ type: type });
        // const user = await User.findOne({ username });

        if (!category && !username)
            throw new Error("Category and Username Not Found")
        else if (!category)
            throw new Error("Category Not Found")
        else if (!user)
            throw new Error("Username Not Found")

        const newTransaction = new transactions({ username, amount, type: category.type });
        const transactionSaved = await newTransaction
            .save()
            .catch((err) => { throw err; })

        res.json({
            data: {
                username: transactionSaved.username,
                amount: transactionSaved.amount,
                type: transactionSaved.type,
                date: transactionSaved.date
            },
            refreshedTokenMessage: res.locals.message
        })

    }
    catch (error) {
        if (error.message === "Empty string: param-username")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({
                error: error.message,
                refreshedTokenMessage: res.locals.message
            })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {

        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })

        const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })


        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json({
                data: data,
                refreshedTokenMessage: res.locals.message
            });
        }).catch(error => { throw (error) })

    } catch (error) {
        res.status(400).json({
            error: error.message,
            refreshedTokenMessage: res.locals.message
        })

    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        let info = {};
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {
            info = { authType: "Admin", username: handleString(req.params.username, "username"), token: user ? user.refreshToken : 0 };

        } else {
            info = { authType: "User", username: handleString(req.params.username, "username"), token: user ? user.refreshToken : 0 };
        }

        // Verify the authentication
        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({
                error: verify.cause,
                refreshedTokenMessage: res.locals.message
            })

        // Verify if the user exists
        const userByUsername = await User.findOne({ username: info.username });
        if (!userByUsername)
            throw new Error("User not found");

        // Do the query
        const objDate = handleDateFilterParams(req);
        const objAmount = handleAmountFilterParams(req);

        if (!objDate.flag)
            throw new Error(objAmount.error)

        if (!objAmount.flag)
            throw new Error(objAmount.error)

        let selectedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    $and: [
                        { 'username': info.username },
                        // { 'date': obj.date },
                        objDate.queryObj,
                        objAmount.queryObj
                    ]

                }
            },
            { $unwind: "$categories_info" },

        ]);

        selectedTransactions = selectedTransactions.map(transaction => Object.assign({}, { _id: transaction._id, username: transaction.username, amount: transaction.amount, type: transaction.type, color: transaction.categories_info.color, date: transaction.date }));

        return res.status(200).json({
            data: selectedTransactions,
            refreshedTokenMessage: res.locals.message
        })

    } catch (error) {
        if (error.message === "Empty string: username")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({
                error: error.message,
                refreshedTokenMessage: res.locals.message
            })

    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        let info = {};
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {
            // /transactions/users/:username/category/:category
            info = { authType: "Admin", username: handleString(req.params.username, "username"), category: handleString(req.params.category, "category"), token: user ? user.refreshToken : 0 };

        } else {
            // /users/:username/transactions/category/:category
            info = { authType: "User", username: handleString(req.params.username, "username"), category: handleString(req.params.category, "category"), token: user ? user.refreshToken : 0 };
        }

        // Verify the authentication
        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })

        // Verify if the user exists
        const userByUsername = await User.findOne({ username: info.username });
        if (!userByUsername)
            throw new Error("User not found");

        // Verify if the category exists
        const category = await categories.findOne({ type: info.category });
        if (!category)
            throw new Error("Category not found");

        // Do the query
        let selectedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    $and: [
                        { 'username': info.username }, // Condizione di join
                        { 'type': info.category } // Condizione di filtro
                    ]

                }
            },
            { $unwind: "$categories_info" }
        ]);

        selectedTransactions = selectedTransactions.map(transaction => Object.assign({}, { _id: transaction._id, username: transaction.username, amount: transaction.amount, type: transaction.type, color: transaction.categories_info.color, date: transaction.date }));

        return res.status(200).json({
            data: selectedTransactions,
            refreshedTokenMessage: res.locals.message
        });


    } catch (error) {
        if (error.message === "Empty string: category" || error.message === "Empty string: username")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({
                error: error.message,
                refreshedTokenMessage: res.locals.message
            })
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        let info = {};
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/groups/") >= 0) {
            // /transactions/groups/:name
            info = { authType: "Admin", groupName: handleString(req.params.name, "name"), token: user ? user.refreshToken : 0 };

        } else {
            // /groups/:name/transactions
            info = { authType: "Group", groupName: handleString(req.params.name, "name"), token: user ? user.refreshToken : 0 };
        }
        // Verify if the group exists
        const group = await Group.findOne({ name: info.groupName });
        if (!group)
            throw new Error("Group not found");
        else
            info.emailList = await group.members.map(element => element.email);


        // Verify the authentication
        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })


        // Do the query
        let selectedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "user_info"
                }
            },
            {
                $match: { 'user_info.email': { $in: info.emailList } }
            },
            { $unwind: "$categories_info" },
            { $unwind: "$user_info" }
        ]);

        selectedTransactions = selectedTransactions.map(transaction => Object.assign({}, { _id: transaction._id, username: transaction.username, amount: transaction.amount, type: transaction.type, color: transaction.categories_info.color, date: transaction.date }));

        return res.status(200).json({
            data: selectedTransactions,
            refreshedTokenMessage: res.locals.message
        });


    } catch (error) {
        if (error.message === "Empty string: name")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({
                error: error.message,
                refreshedTokenMessage: res.locals.message
            })
    }

}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        let info = {};
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/groups/") >= 0) {
            // /transactions/groups/:name/category/:category
            info = { authType: "Admin", groupName: handleString(req.params.name, "name"), category: handleString(req.params.category, "category"), token: user ? user.refreshToken : 0 };

        } else {
            // /groups/:name/transactions/category/:category
            info = { authType: "Group", groupName: handleString(req.params.name, "name"), category: handleString(req.params.category, "category"), token: user ? user.refreshToken : 0 };
        }
        // Verify if the group exists
        const group = await Group.findOne({ name: info.groupName });
        if (!group)
            throw new Error("Group not found");
        else
            info.emailList = await group.members.map(element => element.email);


        const category = await categories.findOne({ type: info.category });
        if (!category)
            throw new Error("Category not found");
        // Verify the authentication
        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })


        // Do the query
        let selectedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "user_info"
                }
            },
            {
                $match: {
                    $and: [
                        { 'user_info.email': { $in: info.emailList } },
                        { 'type': info.category }
                    ]

                }
            },
            { $unwind: "$categories_info" },
            { $unwind: "$user_info" }
        ]);

        selectedTransactions = selectedTransactions.map(transaction => Object.assign({}, { _id: transaction._id, username: transaction.username, amount: transaction.amount, type: transaction.type, color: transaction.categories_info.color, date: transaction.date }));

        return res.status(200).json({
            data: selectedTransactions,
            refreshedTokenMessage: res.locals.message
        });


    } catch (error) {
        if (error.message === "Empty string: name" || error.message === "Empty string: category")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else res.status(400).json({
            error: error.message,
            refreshedTokenMessage: res.locals.message
        })

    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        // /users/:username/transactions   

        const token_user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        const info = { authType: "User/Admin", username: handleString(req.params.username, "username"), token: token_user ? token_user.refreshToken : 0 };

        const user = await User.findOne({ username: info.username });
        if (!user)
            throw new Error("User not found");
        if (!req.body._id)
            throw new Error("Missing id")
        const idTransaction = req.body._id;
        if (!idTransaction.match(/[0-9a-fA-F]{24}$/))
            throw new Error("Invalid ID")
        const transaction = await transactions.findOne({ _id: idTransaction });
        if (!transaction)
            throw new Error("Transaction not found");

        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })

        await transactions.deleteOne({ _id: req.body._id });
        return res.status(200).json({ data: { message: "Transaction deleted" }, refreshedTokenMessage: res.locals.message });

    } catch (error) {
        if (error.message === "Empty string: username")
            res.status(404).json({
                error: "Service Not Found. Reason: " + error.message,
                refreshedTokenMessage: res.locals.message
            })
        else
            res.status(400).json({ error: error.message, refreshedTokenMessage: res.locals.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        // /transactions
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
        const info = { authType: "Admin", token: user ? user.refreshToken : 0 };
        if (!req.body._ids)
            throw new Error("Missing ids")
        const verify = verifyAuth(req, res, info)
        if (verify.flag === false)
            return res.status(401).json({ error: verify.cause })

        let ids = req.body._ids.map(element => {
            const id = element.toString();

            if (!id.match(/[0-9a-fA-F]{24}$/))
                throw new Error("Invalid ID")
            else if (id = "")
                throw new Error("You inserted an empty string as Id")
            else
                return id;
        })

        let selectedTransactions = await Promise.all(ids.map(async (element) => {
            const el = await transactions.findById(element)
            if (!el)
                throw new Error("One or more Transactions not found");
            else
                return el;
        }));

        await transactions.deleteMany({ _id: { $in: ids } })

        return res.json({
            data: { message: "Transactions deleted" },
            refreshedTokenMessage: res.locals.message
        });

    } catch (error) {
        res.status(400).json({ error: error.message, refreshedTokenMessage: res.locals.message })
    }
}
