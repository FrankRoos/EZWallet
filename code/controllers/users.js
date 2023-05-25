import { modelNames } from "mongoose";
import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { handleString, verifyAuth } from "./utils.js";
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
    
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
    if (verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })) {

      const users = await User.find();
      const emptyArray = [];
      if (!users)
        res.status(200).json({
          data: {
            emptyArray
          },
          message: res.locals.message
        })
      res.status(200).json({
        data: {
          users
        },
        message: res.locals.message
      })
    }
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
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken })
    let username = req.params.username;
    username = handleString(username, "username");

    if (verifyAuth(req, res, { authType: "User/Admin", username: username, token: user ? user.refreshToken : 0 })) {

      const usersearch = await User.findOne({ username: username })
      if (!usersearch) return res.status(401).json({ message: "User not found" })
      res.status(200).json({
        data: {
          usersearch
        },
        message: res.locals.message
      })
    }
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
    
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if(!user){
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (verifyAuth(req, res, { authType: "User/Admin", username: user.username, token: user ? user.refreshToken : 0 })) {
      let { name, memberEmails } = req.body;
      name = handleString(name, "name");
      const groupExists = await Group.findOne({ name });

      if (groupExists) {
        return res.status(401).json({ message: 'There is already an existing group with the same name' });
      }
      /*for (const email of memberEmails) {
        const existingUserInGroup = await Group.findOne({ 'members.email': email });

        if (existingUserInGroup) {
          return res.status(401).json({ message: `User with email ${email} is already a member of another group` });
        }
      }
      */
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
      if (memberEmails.length === 0) return res.status(401).json({ message: "memberEmails is empty" });
      if (memberEmails.length === alreadyInGroup.length + membersNotFound.length)
        return res.status(401).json({ message: "all the `memberEmails` either do not exist or are already in a group" });
      /*if (members.length === 0 || alreadyInGroup.length > 0 || membersNotFound.length > 0) {
        return res.status(401).json({ message: "all the `memberEmails` either do not exist or are already in a group" });
      }*/
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
        },
        message: res.locals.message
      });
    }
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
    
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    const authAdmin = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 });

    if (authAdmin) {
      const groups = await Group.find();
      const responseData = {
        data: groups.map(group => ({
          name: group.name,
          members: group.members
        })),
        message: res.locals.message
      };

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
export const getGroup = async (req, res) => {
  try {
    
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if(!user){
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(404).json({ message: `The group ${groupName} does not exist` });
      }
      const groupInfo = {
        name: group.name,
        members: group.members
      };
      return res.status(200).json({
        data: {
          groupInfo
        }, message: res.locals.message
      });
    }

    if (user.role === "Regular") {
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(401).json({ message: `The group ${groupName} does not exist` });
      }

      if (verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })) {
        const groupInfo = {
          name: group.name,
          members: group.members
        };
        return res.status(200).json({
          data: {
            groupInfo
          }, message: res.locals.message
        });
      }
    }
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
export const addToGroup = async (req, res) => {
  try {
    
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!user) return res.status(400).json('Unauthorized');

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }
      //Admin things
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      console.log("3");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }

      const { memberEmails } = req.body;//gets the array of emails on the body
      if (!memberEmails || memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }

      const alreadyInGroup = [];
      const membersNotFound = [];
      for (const email of memberEmails) {
        const user = await User.findOne({ email });
        if (!user) {
          membersNotFound.push(email);
        } else {
          const existingGroup = await Group.findOne({
            'members.email': email,
          });

          if (existingGroup) {
            alreadyInGroup.push(user.username);
          } else {
            const memberExists = group.members.some(
              (member) => member.email === email
            );
            if (!memberExists) {
              group.members.push({ email: user.email, user: user._id });
            }
          }
        }
      }

      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({
          message: "The member emails you provided either don't exist or are already in other groups"
        });
      }

      await group.save();

      const responseData = {
        data: {
          group: {
            name: group.name,
            members: group.members,
          },
          alreadyInGroup,
          membersNotFound,
        }, message: res.locals.message
      };
      return res.json(responseData);
    }

    if (user.role === "Regular") {
      if(req.url.indexOf("insert")>0)
        return res.status(401).json({ message: "You are trying to use an Admin route while still a Regular" });
      //User things   
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }

      const { memberEmails } = req.body;//gets the array of emails on the body
      if (!memberEmails || memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }
      const alreadyInGroup = [];
      const membersNotFound = [];
      for (const email of memberEmails) {
        const user = await User.findOne({ email });
        if (!user) {
          membersNotFound.push(email);
        } else {
          const existingGroup = await Group.findOne({
            'members.email': email,
          });

          if (existingGroup) {
            alreadyInGroup.push(user.username);
          } else {
            const memberExists = group.members.some(
              (member) => member.email === email
            );
            if (!memberExists) {
              group.members.push({ email: user.email, user: user._id });
            }
          }
        }
      }
      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({ message: "The member emails you provided either don't exist or are already in the group" });
      }
      //console.log(group.members);
      if (verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })) {
        const responseData = {
          data: {
            group: {
              name: group.name,
              members: group.members,
            },
            alreadyInGroup,
            membersNotFound,
          }, message: res.locals.message
        };
        await group.save();
        return res.status(200).json(responseData);
      }
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
export const removeFromGroup = async (req, res) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!user) return res.status(400).json('user not found');
    let group = req.body.group;
  
    let group_name = handleString(group.name, "group_name");
    let group_name_params = req.params.name;
    group_name_params = handleString(group_name_params, "group_name_params")

    if (group_name_params !== group_name) {
      return res.status(401).json({ message: "The group name provided in the URL and the one given in the body don't match" });
    }

    if (user.role === "Admin" && req.url.indexOf("/groups/:name/pull")) {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }
      //admin logic
      // Check if the group exists

      const existingGroup = await Group.findOne({ name: group.name });
      if (!existingGroup) {
        return res.status(401).json({ message: "Group does not exist" });
      }
      const membersNotFound = [];
      const notInGroup = [];
      const removedMembers = [];

      for (const member of group.members) {
        const user = await User.findOne({ email: member });
        if (!user) {
          membersNotFound.push(member);
        } else if (!existingGroup.members.some((groupMember) => groupMember.email === member)) {//this else if checks if the currect member is a part of the existingGroup, 
          if (!existingGroup.members.some((groupMember) => groupMember.email === member)) {//if it is it doesn't do nothing
            notInGroup.push(member);
          }
        }
      }

      for (const member of existingGroup.members) {
        if (!group.members.includes(member.email)) {
          removedMembers.push(member.email);
          //console.log(removedMembers);
        }
      }

      // Remove existingUsers from the group
      existingGroup.members = existingGroup.members.filter((member) =>
        group.members.includes(member.email)
      );

      if (removedMembers.length === 0) {
        return res.status(200).json({ message: "No members have been removed from the group" });
      }

      const updatedGroup = await existingGroup.save();
      return res.status(200).json({
        data: {
          message: "Members removed from the group successfully",
          group: updatedGroup,
          removedMembers: removedMembers,
          notInGroup: notInGroup,
          membersNotFound: membersNotFound,
        },
        message: res.locals.message
      });
    }
    if (user.role === "Regular") {
      if(req.url.indexOf("pull")>0)
        return res.status(401).json({ message: "You are trying to use an Admin route while still a Regular" });
      //user logic      
      const existingGroup = await Group.findOne({ name: group.name });
      if (!existingGroup) {
        return res.status(401).json({ message: "Group does not exist" });
      }
      if (!existingGroup.members.some((member) => member.email === user.email)) {
        return res.status(401).json({ message: "You are not a member of this group" });
      }

      const membersNotFound = [];
      const notInGroup = [];
      const removedMembers = [];

      for (const member of group.members) {
        const user = await User.findOne({ email: member });
        if (!user) {
          membersNotFound.push(member);
        } else if (!existingGroup.members.some((groupMember) => groupMember.email === member)) {//this else if checks if the currect member is a part of the existingGroup, 
          if (!existingGroup.members.some((groupMember) => groupMember.email === member)) {//if it is it doesn't do nothing
            notInGroup.push(member);
          }
        }
      }

      for (const member of existingGroup.members) {
        if (!group.members.includes(member.email)) {
          removedMembers.push(member.email);
          //console.log(removedMembers);
        }
      }

      // Remove existingUsers from the group
      existingGroup.members = existingGroup.members.filter((member) =>
        group.members.includes(member.email)
      );

      if (removedMembers.length === 0) {
        return res.status(200).json({ message: "No members have been removed from the group" });
      }
      if (verifyAuth(req, res, { authType: "Group", emailList: existingGroup.members.map(member => member.email), token: user ? user.refreshToken : 0 })) {
        const updatedGroup = await existingGroup.save();
        return res.status(200).json({
          data: {
            message: "Members removed from the group successfully",
            group: updatedGroup,
            removedMembers: removedMembers,
            notInGroup: notInGroup,
            membersNotFound: membersNotFound,
          },
          message: res.locals.message
        });

      }
    }

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
    const cookie = req.cookies;
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    if (verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })) {
      const existingUser = await User.findOneAndDelete({ email: req.body.email });
      if (!existingUser) return res.status(401).json({ message: "User doesn't exists" });

      //Delete all transaction of existingUser and retrieve the number.
      const transaction = await transactions.deleteMany({ username: existingUser.username });
      //delete the user from all existing group.... che partecapita
      let data = { deleteTransactions: transaction.deletedCount, deletedFromGroup: false }

      const group = await Group.findOne({ "members.email": existingUser.email });

      if (group) {
        group.members = group.members.filter((member) => member.email !== existingUser.email);
        await group.save();
        data.deletedFromGroup = true;
      }

      //delete users .....
      res.status(200).json({
        data: {
          data
        },
        message: res.locals.message
      })
    }
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
    const cookie = req.cookies;
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    const authAdmin = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 });
    if (authAdmin) {
      let { name } = req.body;
      name = handleString(name, "name");

      const existingGroup = await Group.findOne({ name });
      if (!existingGroup)
        return res.status(401).json({ message: `Group ${name} does not exist` });

      const data = await Group.findOneAndDelete({ name });

      return res.json({
        data: `Group ${name} has been deleted`,
        message: res.locals.message
      });
      //res.status(200).json(`Group ${name} deleted`);
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}
