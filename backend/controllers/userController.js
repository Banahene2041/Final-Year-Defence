import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
// @desc register User
//  route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { surname, firstname, birthDate, gender, email, password } = req.body
  const userExist = await User.findOne({ email })

  if (userExist) {
    res.status(400)
    throw new Error("User already exist")
  }

  const user = await User.create({
    surname,
    firstname,
    birthDate,
    gender,
    email,
    password,
  })

  if (user){
    generateToken(res, user._id)
    res.status(201).json({
        _id: user._id,
        surname: user.surname,
        firstname: user.firstname,
        email: user.email,
    })
  }
  else{
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc Auth User / set token
//  route POST /api/users/auth
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id)
      res.status(201).json({
        token,
        userData: {
          _id: user._id,
          surname: user.surname,
          firstname: user.firstname,
          email: user.email,
        },
      })
    } else {
      res.status(401)
      throw new Error("Invalid email or password")
    }
})

// @desc Logout User
//  route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ message: "User logged out" })
})

// @desc Get user profile
//  route GET /api/users/profile
// @access private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      surname: req.user.surname,
      firstname: req.user.firstname,
      birthDate: req.user.birthDate,
      gender: req.user.gender,
      email: req.user.email,
      location: req.user.location,
      contact: req.user.contact,
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
})

// @desc update User profile
//  route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  
  if (user){
    user.surname = req.body.surname || user.surname
    user.firstname = req.body.firstname || user.firstname
    user.birthDate = req.body.birthDate || user.birthDate,
    user.gender = req.body.gender || user.gender
    user.email = req.body.email || user.email
    user.contact = req.body.contact || user.contact
    user.location = req.body.location || user.location

    if (req.body.password){
      user.password = req.body.password
    }

    const updatedUser = await user.save()
    res.status(200).json({
      _id: updatedUser._id,
      surname: updatedUser.surname,
      firstname: updatedUser.firstname,
      email: updatedUser.email,
      location: updatedUser.location,
      contact: updatedUser.contact,
    })
  }
  else{
    res.status(404)
    throw new Error("User not found")
  }
  
})

const forgotPassword = asyncHandler( async(req,res) => {
  const {email} = req.body
  const oldUser = await User.findOne({email})

  if (!oldUser) {
    res.status(400)
    throw new Error("User doesn't Exist")
  }
  const secret = process.env.JWT_SECRET + oldUser.password
  const token = jwt.sign({email:oldUser.email,id:oldUser._id},secret,{expiresIn:"10m"})
  const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`
  // console.log(link);
  // nodemailer

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host:"smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user:process.env.EMAILS,
      pass: process.env.EMAILS_PASSWORD,
    },
  })

  const mailOptions = {
    from: {
      name: "GIV PHARM",
      address: process.env.EMAILS,
    },
    to: [email],
    subject: "Password Reset",
    text: `${link}`,
    html: `
    <h3 style="color:#000;">Password Reset</h3>
    <p style="font-size:1rem; color:#000">You are receiving this email because we received a password reset request for your account. click on the button to reset password</p>
    <button style="background:#087125; border: none; cursor: pointer; padding:.5rem .3rem; border-radius:.3rem; font-size:.95rem;">
    <a href="${link}" style="color:#fff; text-decoration:none;">Reset Passsword</a></button>
    `,
  }

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions)
      console.log("Email has been sent!");
    } catch (error) {
      console.log(error);
    }
  }

  sendMail(transporter, mailOptions)


  res.status(200).json({link})
})

const updatePassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params
  const { password } = req.body
  const oldUser = await User.findById(id)
  // console.log(oldUser);
  if (!oldUser){
    res.status(400)
    throw new Error("User do not Exist")
  }

  const secret = process.env.JWT_SECRET + oldUser.password
  const isTokenValid = jwt.verify(token,secret)
  
  if (!isTokenValid) {
    res.status(400)
    throw new Error("Token has Expired")
  }
  // const hashedPassword = await bcrypt.hash(password,10)

  if (password) {
    oldUser.password = password
  }
    const updatedUser = oldUser.save()
  res.status(200).json({
    _id: updatedUser._id,
    surname: updatedUser.surname,
    firstname: updatedUser.firstname,
    email: updatedUser.email,
  })
})

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  updatePassword,
}
