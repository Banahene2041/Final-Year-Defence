import express from "express"
const router = express.Router()
import {
  addDrug,
  getAllDrugs,
  getDrug,
  getDrugsByCategory,
  getRecentlyAddedDrugs,
  getRecentSearches,
  getPopularDrugs,
  removeDrug,
  searchDrugs,
  updateDrug,
} from "../controllers/drugController.js"
import multer from "multer"

// image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`)
  },
})

const upload = multer({ storage: storage })

router.get("/search", searchDrugs)
router.get("/filter/category", getDrugsByCategory)
router.get("/recent-searches", getRecentSearches)
router.get("/recently-added", getRecentlyAddedDrugs)
router.get("/popular", getPopularDrugs)
router.post("/add", upload.single("image"), addDrug)
router.patch("/:id", upload.single("image"), updateDrug)
router.get("/", getAllDrugs)
router.get("/:id", getDrug)
router.delete("/remove/:id", removeDrug)
export default router
