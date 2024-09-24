import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.cookie) {
    const cookies = req.headers.cookie
    const cookieArray = cookies.split(";").map((cookie) => cookie.trim())
    const jwtCookie = cookieArray.find((cookie) => cookie.startsWith("jwt="))

    if (jwtCookie) {
      token = jwtCookie.split("=")[1]
    }
  }

  if (token) {
    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.userId).select("-password")

      next()
    } catch (error) {
      res.status(401)
      throw new Error("Not authorized, Invalid token")
    }
  } else {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

export { protect }
