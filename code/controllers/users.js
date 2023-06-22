import { modelNames } from "mongoose";
import { Group  } from "../models/User.js";
import { transactions } from "../models/model.js";
import { handleString, verifyAuth } from "./utils.js";
import jwt from 'jsonwebtoken';
import { User  } from "../models/User.js";
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
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.message
      })

    const users = await User.find();
   
    const emptyArray = [];
    if (users.length <= 1 || !users) 
      return res.status(400).json({
        data: emptyArray,
        refreshedTokenMessage: res.locals.message
      })

      let filter = users.map(v => Object.assign({}, { username: v.username, email: v.email,role: v.role }))
  
    
    res.status(200).json({
      data: filter,
      refreshedTokenMessage: res.locals.message
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      refreshedTokenMessage: res.locals.message
    });
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
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.message
      })

    let usersearch = await User.findOne({ username: username })
    if (!usersearch) return res.status(400).json({ error: "User not found" ,refreshedTokenMessage: res.locals.message})
    let final_user = { username: usersearch.username,email: usersearch.email, role: usersearch.role }

    res.status(200).json({
      data: final_user,
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
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      })

    let { name, memberEmails } = req.body;
    if (!name || !memberEmails) {
      return res.status(400).json({
        error: 'Missing attributes in the request body',
        refreshedTokenMessage: res.locals.message
      });
    }
    name = handleString(name, "name");
  

    const groupExists = await Group.findOne({name: name });
    if (groupExists) {
      return res.status(400).json({
        error: 'There is already an existing group with the same name',
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    const userGroup = await Group.findOne({email: user.email });
    if (userGroup) {
      return res.status(400).json({
        error: 'You are already a member of a group',
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
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
            members.push({ email});
          }
        }
      }
    }
    if (memberEmails.length === 0) return res.status(401).json({ message: "memberEmails is empty" });
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        data: {
          message: "Invalid email format or email with empty string",
          invalidEmails
        },
        refreshedTokenMessage: res.locals.message
      });
    }

    if (memberEmails.length === alreadyInGroup.length + membersNotFound.length)
      return res.status(400).json({
        error: "all the `memberEmails` either do not exist or are already in a group",
        refreshedTokenMessage: res.locals.message
      });
   
    members.push({email: user.email})
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
      refreshedTokenMessage: res.locals.message
    });

  } catch (err) {
    res.status(400).json({
      error: err.message,
      refreshedTokenMessage: res.locals.message
    })
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
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.message
      })

    const groups = await Group.find();
    const responseData = {
      data: groups.map(group => ({
        name: group.name,
        members: group.members.map((member) => {return {email: member.email}})
      })),
      refreshedTokenMessage: res.locals.message
    };

    return res.status(200).json(responseData);
  } catch (err) {
    res.status(400).json({
      error: err.message,
      refreshedTokenMessage: res.locals.message
    });
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
    const cookie = req.cookies;
    if (!cookie.refreshToken || !cookie.accessToken) {
      return res.status(401).json({
        error: "Unauthorized",
        refreshedTokenMessage: res.locals.message
      });
    }
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        refreshedTokenMessage: res.locals.message
      });
    }//

    if (user.role === "Admin") {
      const authAdmin = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 });
      if (authAdmin.flag === false) {
        return res.status(401).json({
          error: "Unauthorized as Admin",
          refreshedTokenMessage: res.locals.message
        });
      }
      let groupName = req.params.name;
      //groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({
          error: `The group ${groupName} does not exist`,
          refreshedTokenMessage: res.locals.message
        });
      }
      const groupInfo = {
        name: group.name,
        members: group.members.map(member => ({email:member.email}))
      };
      return res.status(200).json({
        data: groupInfo,
        refreshedTokenMessage: res.locals.message
      });
    }

    if (user.role === "Regular") {
      //console.log("1");
      let groupName = req.params.name;
      if(!groupName) throw new Error('Empty string: groupName')
      //groupName = handleString(groupName, "groupName");
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({
          error: `The group ${groupName} does not exist`,
          refreshedTokenMessage: res.locals.message
        });
      }

      const verify = verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({ 
          error: verify.cause, 
          refreshedTokenMessage: res.locals.message 
        })

      const groupInfo = {
        name: group.name,
        members: group.members.map(member => ({email:member.email}))
      };

      return res.status(200).json({
        data: groupInfo, 
        refreshedTokenMessage: res.locals.message
      });

    }
  } catch (error) {
    if (error.message === "Empty string: groupName")
      res.status(404).json({
        error: "Service Not Found. Reason: " + error.message,
        refreshedTokenMessage: res.locals.message
      })
    res.status(400).json({
      error: error.message,
      refreshedTokenMessage: res.locals.message
    })
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
    const cookie = req.cookies;

    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    let groupName = req.params.name;
    const memberEmails = req.body.emails; //gets the array of emails on the body
    if (!memberEmails) {
      return res.status(400).json({
        error: 'Missing attributes in the request body',
        refreshedTokenMessage: res.locals.message
      });
    }
    if (user.role === "Admin") {

      const verify = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({
          error: verify.cause,
          refreshedTokenMessage: res.locals.message
        })

      //Admin things

      if(!groupName) throw new Error('Empty string: groupName')
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({
          error: "Group does not exist",
          refreshedTokenMessage: res.locals.message
        });
      }

      if (memberEmails.length === 0) {
        return res.status(400).json({
          error: "No member emails provided",
          refreshedTokenMessage: res.locals.message
        });
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
        return res.status(400).json({
          data: {
            message: "Invalid email format or email with empty string",
            invalidEmails
          },
          refreshedTokenMessage: res.locals.message
        });
      }

      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({
          error: "The member emails you provided either don't exist or are already in other groups",
          refreshedTokenMessage: res.locals.message
        });
      }

      await group.save();

      const responseData = {
       
          group: {
            name: group.name,
            members: group.members.map(member => ({email:member.email})),
          },
          alreadyInGroup,
          membersNotFound,
        }
     
      return res.status(200).json({
        data : responseData,
        refreshedTokenMessage: res.locals.message
      });
    }

    if (user.role === "Regular") {
      //console.log("1");
      
      if (req.url.indexOf("insert")> 0)
        return res.status(401).json({
          error: "You are trying to use an Admin route while still a Regular",
          refreshedTokenMessage: res.locals.message
        });
      //User things   

      if(!groupName) throw new Error('Empty string: groupName')
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({ error: "Group does not exist" ,refreshedTokenMessage: res.locals.message});
      }
      const verify = verifyAuth(req, res, { authType: "Group", emailList: group.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({
          error: verify.cause,
          refreshedTokenMessage: res.locals.message
        })


      if (memberEmails.length === 0) {
        return res.status(400).json({
          error: "No member emails provided",
          refreshedTokenMessage: res.locals.message
        });
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
        return res.status(400).json({
          data: {
            message: "Invalid email format or email with empty string",
            invalidEmails
          },
          refreshedTokenMessage: res.locals.message
        });
      }
      if (alreadyInGroup.length + membersNotFound.length === memberEmails.length) {
        return res.status(400).json({
          error: "The member emails you provided either don't exist or are already in the group",
          refreshedTokenMessage: res.locals.message
        });
      }

      const responseData = {
       
          group: {
            name: group.name,
            members: group.members.map(member => ({email:member.email})),
          },
          alreadyInGroup,
          membersNotFound,
        }
     
      await group.save();
      return res.status(200).json({
        data : responseData,
        refreshedTokenMessage: res.locals.message
      });

    }
  } catch (error) {
    if (error.message === "Empty string: groupName")
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
    const cookie = req.cookies;

    const user = await User.findOne({ refreshToken: cookie.refreshToken });
    if (!user) return res.status(400).json({
      error: 'user not found',
      refreshedTokenMessage: res.locals.message
    });
    let groupName = req.params.name;
    if (!groupName) {
      return res.status(404).json({
        error: 'Missing attributes in the params',
        refreshedTokenMessage: res.locals.message
      });
    }
    const { emails } = req.body;
    if (user.role === "Admin") {
      const verify = verifyAuth(req, res, { authType: "Admin", username: user.username, token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({
          error: verify.cause,
          refreshedTokenMessage: res.locals.message
        })
      if(!groupName) throw new Error('Empty string: groupName')
      const existingGroup = await Group.findOne({ name: groupName });
      if (!existingGroup) {
        return res.status(400).json({
          error: "Group does not exist",
          refreshedTokenMessage: res.locals.message
        });
      }

      const membersNotFound = [];
      const notInGroup = [];
      const removedMembers = [];
      const invalidEmails = [];
      const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
      for (const email of emails) {
        if (!myRegEx.test(email) || email === '') {
          invalidEmails.push(email);
        } else {
          const user1 = await User.findOne({ email: email });
          if (!user1) {
            membersNotFound.push(email);
          } else if (!existingGroup.members.some((groupMember) => groupMember.email === email)) {
            notInGroup.push(email);
          } else if (existingGroup.members.some((groupMember) => groupMember.email === email)) {
            removedMembers.push(email);
            existingGroup.members = existingGroup.members.filter((groupMember) => groupMember.email !== email)
          }
        }
      }

      if (existingGroup.members.length === 1 && !removedMembers.length) {
        return res.status(400).json({
          error: "This group contains only 1 member, so you can't delete it",
          refreshedTokenMessage: res.locals.message
        });
      }

      if (membersNotFound.length + notInGroup.length === emails.length) {
        return res.status(400).json({
          error: "All the provided emails represent users that do not belong to the group or do not exist in the database",
          refreshedTokenMessage: res.locals.message
        });
      }
      
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          error: "Invalid email format or email with empty string: " + invalidEmails.toString(),
          refreshedTokenMessage: res.locals.message
        });
      }

      await existingGroup.save();
      const responseData = {
        
          group: {
            name: existingGroup.name,
            members: existingGroup.members.map(member => {return {email:member.email}})
          },
          membersNotFound,
          notInGroup
        }
        
     
      return res.status(200).json({
        data: responseData,
        refreshedTokenMessage: res.locals.message
      });


    }

    if (user.role === "Regular") {
      if (req.url.indexOf("pull") > 0)
        return res.status(401).json({
          error: "You are trying to use an Admin route while still a Regular",
          refreshedTokenMessage: res.locals.message
        });
        if(!groupName) throw new Error('Empty string: groupName')
      const existingGroup = await Group.findOne({ name: groupName });
      if (!existingGroup) {
        return res.status(400).json({
          error: "Group does not exist",
          refreshedTokenMessage: res.locals.message
        });
      }

      const membersNotFound = [];
      const notInGroup = [];
      const removedMembers = [];
      const invalidEmails = [];
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
        }
      }

      if (existingGroup.members.length === 1 && !removedMembers.length) {
        return res.status(400).json({
          error: "This group contains only 1 member, so you can't delete it",
          refreshedTokenMessage: res.locals.message
        });
      }

      if (membersNotFound.length + notInGroup.length === emails.length) {
        return res.status(400).json({
          error: "All the provided emails represent users that do not belong to the group or do not exist in the database",
          refreshedTokenMessage: res.locals.message
        });
      }
     
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          error: "Invalid email format or email with empty string: " + invalidEmails.toString(),
          refreshedTokenMessage: res.locals.message
        });
      }
      const verify = verifyAuth(req, res, { authType: "Group", emailList: existingGroup.members.map(member => member.email), token: user ? user.refreshToken : 0 })
      if (verify.flag === false)
        return res.status(401).json({
          error: verify.cause,
          refreshedTokenMessage: res.locals.message
        })

      await existingGroup.save();
      const responseData = {
        
          group: {
            name: existingGroup.name,
            members: existingGroup.members.map((member) =>{return {email: member.email}})
          },
          membersNotFound,
          notInGroup
        
      }
      return res.status(200).json({
        data: responseData,
        refreshedTokenMessage: res.locals.message
      });
    }

  } catch (error) {
      res.status(400).json({
        error: error.message,
        refreshedTokenMessage: res.locals.message
      })
  }
}


/**
 * Delete a user
- Request Parameters: None
- Request Body Content: A string equal to the `email` of the user to be deleted
  - Example: `{email: "luigi.red@email.com"}`
- Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and an attribute that specifies whether the user was also `deletedFromGroup` or not
  - Example: `res.status(200).json({data: {deletedTransaction: 1, deletedFromGroup: true}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- If the user is the last user of a group then the group is deleted as well
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the email passed in the request body is an empty string
- Returns a 400 error if the email passed in the request body is not in correct email format
- Returns a 400 error if the email passed in the request body does not represent a user in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteUser = async (req, res) => {
  try {

    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });

    const verify = verifyAuth(req, res, { authType: "Admin", token: user ? user.refreshToken : 0 })
    if (verify.flag === false)
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.message
      })
    let { email } = req.body;
    if (!email && email !== '') {
      return res.status(400).json({
        error: 'Missing attribute in the request body',
        refreshedTokenMessage: res.locals.message
      });
    }
    if (email === '') {
      return res.status(400).json({
        error: 'The attribute in the request body is empty',
        refreshedTokenMessage: res.locals.message
      });
    }
    const myRegEx = /^\w+([\.-]?\w+)*@[a-z]([\.-]?[a-z])*(\.[a-z]{2,3})+$/;
    if (!myRegEx.test(email)){
      return res.status(400).json({
        error: "email format is not correct",
        refreshedTokenMessage: res.locals.message
      });
    }

    const user_is_admin = await User.findOne({ email: req.body.email });
    if(user_is_admin && user_is_admin.role === 'Admin'){
      return res.status(400).json({
        error: "The user to delete is an Admin",
        refreshedTokenMessage: res.locals.message
      });
    }

    const existingUser = await User.findOneAndDelete({ email: req.body.email });
    if (!existingUser) return res.status(400).json({
      error: "User not found",
      refreshedTokenMessage: res.locals.message
    });

    //Delete all transaction of existingUser and retrieve the number.
    const transaction = await transactions.deleteMany({ username: existingUser.username });
    //delete the user from all existing group.... che partecapita
    let data = { deletedTransactions: transaction.deletedCount, deletedFromGroup: false }

    const group = await Group.findOne({ "members.email": existingUser.email });
   
    if(!group)
      return res.status(200).json({
        data: data,
        refreshedTokenMessage: res.locals.message
      })

    if (group.members.length) {
      group.members = group.members.filter((member) => member.email !== existingUser.email);
      data.deletedFromGroup = true;
      const l2 = group.members.length
      if (group.members.length < 1) {
        await Group.findByIdAndDelete(group._id);
      } else {
        await group.save();
      }
    
    }

    res.status(200).json({
      data: data,
      refreshedTokenMessage: res.locals.message
    })
  } catch (err) {
    res.status(400).json({
      error: err.message,
      refreshedTokenMessage: res.locals.message
    })
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
      return res.status(401).json({
        error: verify.cause,
        refreshedTokenMessage: res.locals.message
      })

    let { name } = req.body;
    if (!name && name !== '') {
      return res.status(400).json({
        error: 'Missing attribute in the request body',
        refreshedTokenMessage: res.locals.message
      });
    }
    if (name === '') {
      return res.status(400).json({
        error: 'The attribute in the request body is empty',
        refreshedTokenMessage: res.locals.message
      });
    }
    //name = handleString(name, "name");

    const existingGroup = await Group.findOne({ name });
    if (!existingGroup)
      return res.status(400).json({
        error: `Group ${name} does not exist`,
        refreshedTokenMessage: res.locals.message
      });

    const data = await Group.findOneAndDelete({ name });

    return res.status(200).json({
      data: { message: `Group ${name} has been deleted` },
      refreshedTokenMessage: res.locals.message
    });


  } catch (err) {
    res.status(400).json({
      error: err.message,
      refreshedTokenMessage: res.locals.message
    })
  }
}
