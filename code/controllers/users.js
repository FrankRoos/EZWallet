import { modelNames } from "mongoose";
import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";
import jwt from 'jsonwebtoken';
/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken })
    if (!admin) return res.status(400).json('admin not found')
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" })


    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const username = req.params.username
    const user = await User.findOne({ refreshToken: cookie.refreshToken })
    if (!user) return res.status(401).json({ message: "User not found" })
    if (user.username !== username && user.role != "Admin") return res.status(401).json({ message: "Unauthorized" })
    const usersearch = await User.findOne({ username: username })
    if (!usersearch) return res.status(401).json({ message: "User not found" })
    res.status(200).json(usersearch)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */

export const createGroup = async (req, res) => {
  try {
    const { name, memberEmails } = req.body;
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    //console.log(user);
    if (!user) return res.status(400).json('user not found')
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name cannot be NULL or empty" });
    }

    const authUserorAdmin = verifyAuth(req, res, { authType: "User", username: user.username });
    if (!authUserorAdmin) {
      return res.status(401).json({ message: "Unauthorized as Admin" });
    }

    //console.log("Request received: ", name, memberEmails);
    const groupExists = await Group.findOne({ name });
    //Optional behavior
    if (groupExists) {
      return res.status(401).json({ message: 'There is already an existing group with the same name' });
    }
    const members = [];
    const alreadyInGroup = [];
    const membersNotFound = [];

    for (const email of memberEmails) {
      const user = await User.findOne({ email }); //find the email in db
      if (!user) {
        membersNotFound.push(email);
      } else {
        const existingGroup = await Group.findOne({ 'members.user': user._id });
        if (existingGroup) {
          alreadyInGroup.push(email);
        } else {
          members.push({ email, user: user._id });
        }
      }
    }
    //Optional behavior
    if (members.length === 0 && alreadyInGroup.length > 0 && membersNotFound.length > 0) {
      return res.status(401).json({ message: "all the `memberEmails` either do not exist or are already in a group" });
    }
    //create group with id and mail
    const group = new Group({ name, members });
    await group.save();
    return res.status(200).json({
      data: {
        group: {
          name,
          members
        },
        alreadyInGroup,
        membersNotFound
      }
    });
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    const authAdmin = verifyAuth(req, res, { authType: "Admin" });

    if (authAdmin) {
      const groups = await Group.find();
      const responseData = groups.map(group => ({
        name: group.name,
        members: group.members
      }));

      return res.json(responseData);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {//funziona perfettamente sia per admin che per user regular
  try {

    const cookie = req.cookies;
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    //console.log(user);
    if (!user) return res.status(400).json('user not found')

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", username: user.username });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }


      const groupName = req.params.name;
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(404).json({ message: `The group ${groupName} does not exist` });
      }
      const groupInfo = {
        name: group.name,
        members: group.members
      };
      return res.status(200).json({ data: groupInfo });
    }

    if (user.role === "Regular") {
      const authUser = verifyAuth(req, res, { authType: "User", username: user.username });
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized as User" });
      }

      // Perform user-related tasks here
      const groupName = req.params.name;
      const group = await Group.findOne({ name: groupName, "members.user": user._id });
      if (!group) {
        return res.status(401).json({ message: "You don't have permissions to access this group" });
      }
      const groupInfo = {
        name: group.name,
        members: group.members
      };
      return res.status(200).json({ data: groupInfo });
    }

    //return res.status(401).json({ message: "Unauthorized" });

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
//da finire bisogna fare la versione senza admin anche
export const addToGroup = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    //console.log(user);
    if (!user) return res.status(400).json('user not found')

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", username: user.username });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }
      //now do the things for the admin
      const { name } = req.params;
      if (!name || name.trim() === "") {
        return res.status(401).json({ message: "Group name is NULL or empty" });
      }
      const group = await Group.findOne({ name: name });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }

      const { memberEmails } = req.body;//gets the array of emails on the body
      if (!memberEmails || memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }


      const alreadyInGroup = [];
      const membersNotFound = [];
      //const memberToAdd = [];

      
      for (const email of memberEmails) {
        const user = await User.findOne({ email });
        //console.log(group.members);
        if (!user) {
          membersNotFound.push(email);
        } else {
          //const existingMember = group.members.find(member => member.email === email);
          const existingMember = await Group.findOne({ 'members.email': email });//checks if the user is in one of all the group already
      
          if (existingMember) {
            alreadyInGroup.push(user.username);
          } else {
            group.members.push({ email: user.email, user: user._id });
          }
        }
      }
      if (alreadyInGroup.length  + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({ message: "The member emails you provided either don't exist or are already in other groups" });
      }
      await group.save();

      const responseData = {
        group: {
          name: group.name,
          members: group.members,
        },
        alreadyInGroup,
        membersNotFound,
      };
      return res.json(responseData);
    }

    if (user.role === "Regular") {
      const authUser = verifyAuth(req, res, { authType: "User", username: user.username });
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized as User" });
      }
      const { name } = req.params;
      if (!name || name.trim() === "") {
        return res.status(401).json({ message: "Group name is NULL or empty" });
      }
      const group = await Group.findOne({ name: name });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }

      //checking if the member is a member of the group
      const isMember = group.members.some(member => member.email === user.email);
      if (!isMember) {
        return res.status(401).json({ message: "You are not a member of the group" });
      }

      const { memberEmails } = req.body;//gets the array of emails on the body
      if (!memberEmails || memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }
      const alreadyInGroup = [];
      const membersNotFound = [];
      for (const email of memberEmails) {
        const existingMember = group.members.find(member => member.email === email);
        if (existingMember) {
          alreadyInGroup.push(existingMember.email);
        } else {
          const userToAdd = await User.findOne({ email });
          if (!userToAdd) {
            membersNotFound.push(email);
          } else {
            group.members.push({ email, user: userToAdd._id });
          }
        }
      }
      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({ message: "The member emails you provided either don't exist or are already in the group" });
      }

      await group.save();
      const responseData = {
        group: {
          name: group.name,
          members: group.members,
        },
        alreadyInGroup,
        membersNotFound,
      };
      
      return res.json(responseData);

    }

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
//da finire bisogna fare la versione senza admin anche
export const removeFromGroup = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken });
    if (!admin) return res.status(400).json('admin not found');
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" });
    const groupName = req.body.group.name;
    const { members } = req.body.group;
    const group = await Group.findOne({ name: groupName });
    //existing check of the email in db and if is in the current group
    const membersNotFound = [];
    const notInGroup = [];
    for (const email of members) {
      const user = await User.findOne({ email });
      if (!user) {
        membersNotFound.push(email);
      } else if (!group.members.includes(user._id)) {
        notInGroup.push(email);
      }
    }
    // Optional behavior
    const totalToCheck = membersNotFound.length + notInGroup.length;
    if (totalToCheck === members.length) {
      return res
        .status(401)
        .json({ message: "All the memberEmails either do not exist or are not in the group" });
    }
    // Remove members from the group
    await User.updateMany({ email: { $in: members } }, { $pull: { groups: group._id } });
    group.members = group.members.filter((member) => !members.includes(member.email));

    await group.save();

    const data = {
      group: {
        name: group.name,
        members: group.members,
      },
      notInGroup,
      membersNotFound,
    };

    res.json({ data });
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken })
    if (!admin) return res.status(400).json('admin not found')
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" })

    const existingUser = await User.findOneAndDelete({ email: req.body.email });
    if (!existingUser) return res.status(401).json({ message: "User doesn't exists" });

    //Delete all transaction of existingUser and retrieve the number.

    //delete the user from all existing group.... che partecapita


    //delete users .....
    res.status(200).json("ok")
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    const authAdmin = verifyAuth(req, res, { authType: "Admin" });
    if (authAdmin) {
      const { name } = req.body;
      if (!name || name.trim() === "")
        return res.status(401).json({ message: `You inserted a null string` });

      const existingGroup = await Group.findOne({ name });
      if (!existingGroup)
        return res.status(401).json({ message: `Group ${name} does not exist` });

      const data = await Group.findOneAndDelete({ name });

      return res.json({ message: `Group ${name} has been deleted`, data });
      //res.status(200).json(`Group ${name} deleted`);
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}
