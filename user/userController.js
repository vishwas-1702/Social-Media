import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error getUserProfile ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const followunfollowUser = async (req, res)=>{
   
    try{
      const {userId} = req
        const {id} =req.params;
        const userToModify = await User.findById(id)
        const currentuser = await User.findById(userId);

        if(id === userId.toString()){
            return res.status(400).json({ message: "You cannot follow/unfollow yourself " }); 
        }

        if(!userToModify || !currentuser){
            return res.status(400).json({ message: "User Not Found" }); 
        }

        const isFollowing = currentuser.followers.includes(id);

        if(isFollowing){
            //Unfollow the user
            await User.findByIdAndUpdate(id, {$pull :{ followers : userId}});
            await User.findByIdAndUpdate(userId, {$pull :{ following : id}});
            return res.status(200).json({ message: "User Unfollowed successfully" }); 
            
        }
        else{
            //follow the user
            await User.findByIdAndUpdate(id, {$push :{ followers : userId}});
            await User.findByIdAndUpdate(userId, {$push :{ following : id}});

            const newNotification = new Notification({
              type:"follow",
              from:userId,
              to:userToModify._id
            });
            await newNotification.save();
            res.status(200).json("User Followed Successfully")
            


        }
    }
    catch(error){
        console.log(`Error in followunfollowuser ${error.message}`);
        res.status(500).json({ error: error.message });        
    }

}

export const getSuggestedUsers = async (req, res)=>{
  try{
    const {userId} = req

    const usersFollowedByMe = await User.findById(userId).select("following") //Fetch Users Followed by the Current User
    const  users = await User.aggregate([
      {
        $match:{
          _id:{$ne:userId}
        }
      },
      {$sample: {size:10}}
    ]) // Fetch a Random Sample of Users --> 10 users
    const filterUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id)) // Filter Out Users Already Followed
    const suggestedUsers = filterUsers.slice(0,4); //first 4 users from the filterUsers array to create the final list of suggested users

    const detailedUsers = await User.find({
      _id: { $in: suggestedUsers.map(user => user._id) }
    }).select('-password'); // Exclude the password field

    res.status(200).json(detailedUsers);
  }
  catch(error){
    console.log(`Error in get suggested user ${error.message}`);
    res.status(500).json({ error: error.message });        
    
  }
}

export const updateUser = async (req, res)=>{
  const {fullname ,email, username,currentPassword, newPassword, bio , link } = req.body;
  let {profileImg, coverImg} = req.body;

  const {userId} = req;

  try{
    let user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    if(currentPassword && newPassword){
    if(!newPassword && !currentPassword || !currentPassword && !newPassword){
      return res.status(400).json({error:"Please provide both current and new password"})
    }

    if(currentPassword && newPassword){
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if(!isMatch){
        return res.status(400).json({error:"Current Password is Incorrect"})
      }
      if(newPassword.length <6){
      return res.status(400).json({error:"Password must be atleast 6 charecters long"})
        
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt)
    }
  }
    if(profileImg){
      if(user.profileImg){
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
      }
     const uploadedResponse = await cloudinary.uploader.upload(profileImg)
     profileImg =uploadedResponse.secure_url;
    }

    if(coverImg){
      if(user.coverImg){
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg)
      coverImg =uploadedResponse.secure_url;      
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg= coverImg || user.coverImg;

    await user.save();
    
    return res.status(200).json({message:"Updated Successfully"});

  }
  catch(error){
    console.log(`Error in updateuser ${error.message}`);
    res.status(500).json({ error: error.message });        
  }
}