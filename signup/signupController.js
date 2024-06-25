import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import z from "zod";
import jwt from "jsonwebtoken";



const registerBody = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(5).max(50),
  profilePicture: z.string().optional()
});

const signinBody = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(50),
});

export const signup = async (req, res) => {
  const validatedRegister = registerBody.safeParse(req.body);
  if (!validatedRegister.success) {
      return res.status(411).json({
          message: validatedRegister.error.issues.map(issue =>
              issue.message
          )
      });
  }
  try {
      // const { name, username, email, password, profilePicture } = validatedRegister.data;
      const { name, username, email, password, profilePicture } = req.body;
      const exist = await User.findOne({ $or: [{ email: email }, { username: username }] });
      if (exist) {
          const errorMessage = exist.email === email ? "Email already exists" : "Username already exists";
          return res.status(400).json({
              success: false,
              message: errorMessage
          });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const user = await User.create({
          name: name,
          username: username,
          email: email,
          password: secPass,
          profilePicture: profilePicture
      });
      const data = {
          user: {
              id: user.id
          }
      }

      const token = jwt.sign({ data }, process.env.JWT_SECRET);
      res.status(201).json({
          success: true,
          user,
          token
      })
  } catch (error) {
      console.error(error.message);
      res.status(500).json({
          success: false,
          message: "Internal Server error!"
      });
  }
};



export const login = async (req, res) =>  {
  const validatedSignin = signinBody.safeParse(req.body);
  if (!validatedSignin.success) {
      return res.status(411).json({
          message: validatedSignin.error.issues.map(issue => issue.message)
      });
  }
  try {
      // const { email, password } = validatedSignin.data;
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(400).json({
              success: false,
              message: "Please try to Signin with correct creditentials",
          });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({
              success: false,
              message: "Please try to login with correct creditentials",
          });
      }
      const data = {
          user: {
              id: user.id
          }
      }
      const token = jwt.sign(data, process.env.JWT_SECRET);
      // converting mongoose object to javascript object 
      const obj = user.toObject();
      delete obj.password;

      res.status(201).json({
          success: true,
          user: obj,
          token,
      })
  } catch (error) {
      console.error(error.message);
      res.status(500).json({
          success: false,
          message: "Internal Server error!"
      });
  }
};

export const logout = async (req, res) => {
  try{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged Out SuccessFully"})

  }
  catch (error){
    console.log(`Error in logout ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" }); 
  }
};

export const getMe = async(req, res)=>{
  try{
    // console.log(req)
    const {userId} = req
    const user = await User.findById(userId).select("-password")
    res.status(200).json(user)
  }
  catch(error){
    console.log(`Error in getMe ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" }); 
  
  }
}