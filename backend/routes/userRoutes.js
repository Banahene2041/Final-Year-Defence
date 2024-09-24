import express from "express"
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  updatePassword,
} from "../controllers/userController.js"
const router = express.Router()
import { protect } from "../middleware/authMiddleware.js"

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/forgot-password", forgotPassword)
router.post('/reset-password/:id/:token',updatePassword)
router.post("/logout", logoutUser)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

export default router
