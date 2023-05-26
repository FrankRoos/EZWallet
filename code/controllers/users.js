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

    const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

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

    const verify = verifyAuth(req, res, { authType: "User/Admin", username: username, token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

    const usersearch = await User.findOne({ username: username })
    if (!usersearch) return res.status(401).json({ message: "User not found" })
    res.status(200).json({
      data: {
        usersearch
      },
      message: res.locals.message
    })

  } catch (error) {
    res.status(500).json(error.message)
  }
}

/**
 * Create a new group
  - Request Parameters: None
- Request request body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Example: `{name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]}`
- Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
  - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed in the request body is an empty string
- Returns a 400 error if the group name passed in the request body represents an already existing group in the database
- Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
- Returns a 400 error if the user who calls the API is already in a group
- Returns a 400 error if at least one of the member emails is not in a valid email format
- Returns a 400 error if at least one of the member emails is an empty string
- Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */

export const createGroup = async (req, res) => {
  try {

    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    //if (!user) {
      //return res.status(401).json({ message: "Unauthorized" });
    //}
    const verify = verifyAuth(req, res, { authType: "User/Admin", username: user.username, token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

    let { name, memberEmails } = req.body;
    name = handleString(name, "name");
    if (!name || !memberEmails) {
      return res.status(400).json({ error: 'Missing attributes in the request body' });
    }

    const groupExists = await Group.findOne({ name });
    if (groupExists) {
      return res.status(400).json({ message: 'There is already an existing group with the same name' });
    }

    const userGroup = await Group.findOne({ "members.user": user._id });
    if (userGroup) {
      return res.status(400).json({ message: 'You are already a member of a group' });
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
    const invalidEmails = [];
    const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;

    for (const email of memberEmails) {
      if (!myRegEx.test(email) || email === '') {
        invalidEmails.push(email);
      } else {
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
    }
    //Optional behavior
    if (memberEmails.length === 0) return res.status(401).json({ message: "memberEmails is empty" });
    if (memberEmails.length === alreadyInGroup.length + membersNotFound.length)
      return res.status(401).json({ message: "all the `memberEmails` either do not exist or are already in a group" });

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

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return all the groups
- Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group and an array for the `members` of the group
- Example: `res.status(200).json({data: [{name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getGroups = async (req, res) => {
  try {

    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });

    const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

    const groups = await Group.find();
    const responseData = {
      data: groups.map(group => ({
        name: group.name,
        members: group.members
      })),
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    };

    return res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * Return information of a specific group
- Request Parameters: A string equal to the `name` of the requested group
  - Example: `/api/groups/Family`
- Request Body Content: None
- Response `data` Content: An object having a string attribute for the `name` of the group and an array for the `members` of the group
  - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
 */
export const getGroup = async (req, res) => {
  try {

    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }//

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 });
      if (!authAdmin) {
        return res.status(401).json({ message: "Unauthorized as Admin" });
      }
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({ message: `The group ${groupName} does not exist` });
      }
      const groupInfo = {
        name: group.name,
        members: group.members.map(member => member.email)
      };
      return res.status(200).json({
        data: {
          groupInfo
        }, refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    if (user.role === "Regular") {
      console.log("1");
      let groupName = req.params.name;
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({ message: `The group ${groupName} does not exist` });
      }

      const verify = verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })

      const groupInfo = {
        name: group.name,
        members: group.members.map(member => member.email)
      };
      return res.status(200).json({
        data: {
          groupInfo
        }, message: res.locals.message
      });

    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Add new members to a group
- Request Parameters: A string equal to the `name` of the group
  - Example: `api/groups/Family/add` (user route)
  - Example: `api/groups/Family/insert` (admin route)
- Request Body Content: An array of strings containing the `emails` of the members to add to the group
  - Example: `{emails: ["pietro.blue@email.com"]}`
- Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the created group and an array for the `members` of the group, this array must include the new members as well as the old ones), an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
  - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then no user is added to the group
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
- Returns a 400 error if at least one of the member emails is not in a valid email format
- Returns a 400 error if at least one of the member emails is an empty string
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`

 */
export const addToGroup = async (req, res) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    let groupName = req.params.name;
    const { memberEmails } = req.body;//gets the array of emails on the body
    if (!memberEmails ) {
      return res.status(400).json({ error: 'Missing attributes in the request body' });
    }
    if (user.role === "Admin") {

      const verify = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })

      //Admin things

      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }

      if ( memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }

      const alreadyInGroup = [];
      const membersNotFound = [];
      const invalidEmails = [];
      const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
      for (const email of memberEmails) {
        if (!myRegEx.test(email) || email === '') {
          invalidEmails.push(email);
        } else {
          const user = await User.findOne({ email });
          if (!user) {
            membersNotFound.push(email);
          } else {
            const existingGroup = await Group.findOne({
              'members.email': email,
            });

            if (existingGroup) {
              alreadyInGroup.push(user.email);
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
      }
      if (invalidEmails.length > 0) {
        return res.status(400).json({ message: "Invalid email format or email with empty string", invalidEmails });
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
            members: group.members.map(member => member.email),
          },
          alreadyInGroup,
          membersNotFound,
        }, refreshedTokenMessage: res.locals.refreshedTokenMessage
      };
      return res.json(responseData);
    }

    if (user.role === "Regular") {
      console.log("1");
      if (req.url.indexOf("insert") > 0)
        return res.status(401).json({ message: "You are trying to use an Admin route while still a Regular" });
      //User things   
      
      groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(401).json({ message: "Group does not exist" });
      }
      const verify = verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })
      

      if ( memberEmails.length === 0) {
        return res.status(401).json({ message: "No member emails provided" });
      }
      const alreadyInGroup = [];
      const membersNotFound = [];
      const invalidEmails = [];
      const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
      for (const email of memberEmails) {
        if (!myRegEx.test(email) || email === '') {
          invalidEmails.push(email);
        } else {
          const user = await User.findOne({ email });
          if (!user) {
            membersNotFound.push(email);
          } else {
            const existingGroup = await Group.findOne({
              'members.email': email,
            });

            if (existingGroup) {
              alreadyInGroup.push(user.email);
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
      }
      if (invalidEmails.length > 0) {
        return res.status(400).json({ message: "Invalid email format or email with empty string", invalidEmails });
      }
      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({ message: "The member emails you provided either don't exist or are already in the group" });
      }

      

      const responseData = {
        data: {
          group: {
            name: group.name,
            members: group.members.map(member => member.email),
          },
          alreadyInGroup,
          membersNotFound,
        }, refreshedTokenMessage: res.locals.refreshedTokenMessage
      };
      await group.save();
      return res.status(200).json(responseData);

    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
- Request Parameters: A string equal to the `name` of the group
  - Example: `api/groups/Family/remove` (user route)
  - Example: `api/groups/Family/pull` (admin route)
- Request Body Content: An array of strings containing the `emails` of the members to remove from the group
  - Example: `{emails: ["pietro.blue@email.com"]}`
- Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the created group and an array for the `members` of the group, this array must include only the remaining members), an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
  - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], notInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then no user is removed from the group
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
- Returns a 400 error if at least one of the emails is not in a valid email format
- Returns a 400 error if at least one of the emails is an empty string
- Returns a 400 error if the group contains only one member before deleting any user
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`

 */
export const removeFromGroup = async (req, res) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!user) return res.status(400).json('user not found');
    let groupName = req.params.name;
    if (!groupName) {
      return res.status(400).json({ error: 'Missing attributes in the request body' });
    }
    const { emails } = req.body;
    if (user.role === "Admin") {
      const verify = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })
      groupName = handleString(groupName, "groupName");
      const existingGroup = await Group.findOne({ name: groupName });
      if (!existingGroup) {
        return res.status(400).json({ message: "Group does not exist" });
      }
      
      const membersNotFound = [];
      const notInGroup = [];
      const removedMembers = [];
      const invalidEmails = [];
      const remaining = [];
      const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
      for (const email of emails) {
        if (!myRegEx.test(email) || email === '') {
          invalidEmails.push(email);
        } else {
          const user = await User.findOne({ email: email });
          if (!user) {
            membersNotFound.push(email);
          } else if (!existingGroup.members.some((groupMember) => groupMember.email === email)) {
            notInGroup.push(email);
          } else if (existingGroup.members.some((groupMember) => groupMember.email === email)) {
            removedMembers.push(email);
            existingGroup.members = existingGroup.members.filter((groupMember) => groupMember.email !== email)
          }
          else {
            remaining.push(email);

          }
        }
      }

      if (membersNotFound.length + notInGroup.length === emails.length) {
        return res.status(400).json({ message: "All the provided emails represent users that do not belong to the group or do not exist in the database" });
      }
      if (existingGroup.members.length === 1) {
        return res.status(400).json({ message: "This group contains only 1 member, so you can't delete it" });
      }
      if (invalidEmails.length > 0) {
        return res.status(400).json({ message: "Invalid email format or email with empty string", invalidEmails });
      }

      await existingGroup.save();
      const responseData = {
        data: {
          group: {
            name: existingGroup.name,
            members: existingGroup.members
          },
          membersNotFound,
          notInGroup
        },
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      }
      return res.status(200).json(responseData);


    }

    if (user.role === "Regular") {
      if (req.url.indexOf("pull") > 0)
        return res.status(401).json({ message: "You are trying to use an Admin route while still a Regular" });
        groupName = handleString(groupName, "groupName");
        const existingGroup = await Group.findOne({ name: groupName });
        if (!existingGroup) {
          return res.status(400).json({ message: "Group does not exist" });
        }
        
        const membersNotFound = [];
        const notInGroup = [];
        const removedMembers = [];
        const invalidEmails = [];
        const remaining = [];
        const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
        for (const email of emails) {
          if (!myRegEx.test(email) || email === '') {
            invalidEmails.push(email);
          } else {
            const user = await User.findOne({ email: email });
            if (!user) {
              membersNotFound.push(email);
            } else if (!existingGroup.members.some((groupMember) => groupMember.email === email)) {
              notInGroup.push(email);
            } else if (existingGroup.members.some((groupMember) => groupMember.email === email)) {
              removedMembers.push(email);
              existingGroup.members = existingGroup.members.filter((groupMember) => groupMember.email !== email)
            }
            else {
              remaining.push(email);
  
            }
          }
        }
  
        if (membersNotFound.length + notInGroup.length === emails.length) {
          return res.status(400).json({ message: "All the provided emails represent users that do not belong to the group or do not exist in the database" });
        }
        if (existingGroup.members.length === 1) {
          return res.status(400).json({ message: "This group contains only 1 member, so you can't delete it" });
        }
        if (invalidEmails.length > 0) {
          return res.status(400).json({ message: "Invalid email format or email with empty string", invalidEmails });
        }
        const verify = verifyAuth(req, res, { authType: "Group", emailList: existingGroup.members.map(member => member.email), token: user ? user.refreshToken : 0 })
        if (verify.flag === false)
          return res.status(401).json({ error: verify.cause })
  
        await existingGroup.save();
        const responseData = {
          data: {
            group: {
              name: existingGroup.name,
              members: existingGroup.members
            },
            membersNotFound,
            notInGroup
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage
        }
        return res.status(200).json(responseData);
    }

  } catch (err) {
    res.status(500).json(err.message)
  }
}

export const removeFromGroup2 = async (req, res) => {
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

    if (user.role === "Admin") {

      const verify = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })

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
      if (req.url.indexOf("pull") > 0)
        return res.status(401).json({ message: "You are trying to use an Admin route while still a Regular" });
      //user logic      
      const existingGroup = await Group.findOne({ name: group.name });
      if (!existingGroup) {
        return res.status(401).json({ message: "Group does not exist" });
      }
      const verify = verifyAuth(req, res, { authType: "Group", emailList: existingGroup.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ error: verify.cause })

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

    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });

    const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

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

    //delete users .....fffff
    res.status(200).json({
      data: {
        data
      },
      message: res.locals.message
    })
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
- Request Parameters: None
- Request Body Content: A string equal to the `name` of the group to be deleted
  - Example: `{name: "Family"}`
- Response `data` Content: A message confirming successful deletion
  - Example: `res.status(200).json({data: {message: "Group deleted successfully"} , refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the name passed in the request body is an empty string
- Returns a 400 error if the name passed in the request body does not represent a group in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)

 */
export const deleteGroup = async (req, res) => {
  try {


    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });

    const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({ error: verify.cause })

    let { name } = req.body;
    if (!name || name === '') {
      return res.status(400).json({ error: 'Missing attribute in the request body or the string is empty' });
    }
    name = handleString(name, "name");

    const existingGroup = await Group.findOne({ name });
    if (!existingGroup)
      return res.status(401).json({ message: `Group ${name} does not exist` });

    const data = await Group.findOneAndDelete({ name });

    return res.json({
      data: `Group ${name} has been deleted`,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
    //res.status(200).json(`Group ${name} deleted`);

  } catch (err) {
    res.status(500).json(err.message)
  }
}
