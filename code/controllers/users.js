import { modelNames } from "mongoose";
import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

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
    if (user.username !== username) return res.status(401).json({ message: "Unauthorized" })
    res.status(200).json(user)
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
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken });
    if (!admin) return res.status(400).json('admin not found');
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" });
    //const accessToken = req.cookies.accessToken;
    const groups = await Group.find();
    const responseData = groups.map(group => ({
      name: group.name,
      members: group.members
    }))
    res.json(responseData)
  } catch (err) {
    res.status(500).json(err.message)
  }
}




/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const groupName = req.params.name;
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(401).json({ message: `The group ${groupName} does not exist` });
    }
    const groupInfo = {
      name: group.name,
      members: group.members
    };
    res.status(200).json({ data: groupInfo });

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
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken });
    if (!admin) return res.status(400).json('admin not found');
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" });
    const groupName = req.params.name;
    const { memberEmails } = req.body;
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(401).json({ message: `Group ${groupName} not found` });
    }
    // check if the emails of the members exist in the db, pushing them in the array
    const membersNotFound = [];
    let i = 0;
    for (const email of memberEmails) {
      const user = await User.findOne({ email });
      if (!user) {
        membersNotFound.push(email);
      }
      i++;
    }
    console.log("Membri totali nel body: ", i, memberEmails);
    console.log("Non trovati: ", membersNotFound.length, membersNotFound);
    //same for the email already in a group
    const alreadyInGroup = [];
    for (const email of memberEmails) {
      const user = await User.findOne({ email, groups: group._id });
      //console.log(email, group._id);
      if (user) {
        alreadyInGroup.push(email);
        console.log(email, group._id);
      }
    }
    console.log("Gia in un gruppo: ", alreadyInGroup.length, alreadyInGroup);

    //now can add members to the group
    const newMembers = [];
    for (const email of memberEmails) {
      const user = await User.findOneAndUpdate({ email }, { $addToSet: { groups: group._id } }, { new: true });
      if (user && !membersNotFound.includes(email) && !alreadyInGroup.includes(email)) {
        newMembers.push(user);
      }
    }
    group.members.push(...newMembers);
    console.log("Da aggiungere: ", newMembers.length,newMembers);
    console.log("--------------------------- ");
    //Optional behavior
    const totalToAdd = membersNotFound.length + alreadyInGroup.length;
    if (totalToAdd === i && newMembers.length === 0) {
      return res.status(401).json({ message: "all the memberEmails either do not exist or are already in a group" });
    }
    await group.save();
    // Return response
    return res.json({
      group: {
        name: group.name,
        members: group.members
      },
      alreadyInGroup,
      membersNotFound,
    });
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
    const cookie = req.cookies
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const admin = await User.findOne({ refreshToken: cookie.refreshToken });
    if (!admin) return res.status(400).json('admin not found');
    if (admin.role != "Admin") return res.status(401).json({ message: "You don't have permissions" });
    const {name} = req.body;
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(401).json({ message: `Group ${name} not found` });
    }
    const groupToDelete = await Group.findOneAndDelete({ name });

    
    return res.json({ message: `Group ${name} deleted successfully` });
  } catch (err) {
    res.status(500).json(err.message)
  }
}