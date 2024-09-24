import Drug from "../models/productModel.js"
import fs from "fs"
import asyncHandler from "express-async-handler"

// Add drug
const addDrug = asyncHandler(async (req, res) => {
  let image_filename = `${req.file.filename}`

  const drug = new Drug({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    newPrice: req.body.newPrice,
    quantity: req.body.quantity,
    dosageForm: req.body.dosageForm,
    activeIngredients: req.body.activeIngredients,
    usage: req.body.usage,
    caution: req.body.caution,
    storageInstructions: req.body.storageInstructions,
    location: req.body.location,
    available: req.body.available,
    popular: req.body.popular,
    image: image_filename,
  })
  const drugProduct = await drug.save()
  if (drugProduct) {
    res.status(200).json({ success: true, message: "Drug Added" })
  } else {
    res.status(404)
    throw new Error({ success: false, message: "Error" })
  }
})

// get all drugs
const getAllDrugs = asyncHandler(async (req, res) => {
  const drugs = await Drug.find({})

  if (drugs) {
    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res.status(404)
    throw new Error({ success: false, message: "Error get drugs" })
  }
})

// get a drug
const getDrug = asyncHandler(async (req, res) => {
  const { id: _id } = req.params
  const drug = await Drug.findById(_id)

  if (!drug) {
    res.status(404)
    throw new Error({ success: false, message: "Drug not found" })
  }
  res.status(200).json(drug)
})

// search for drugs
const searchDrugs = asyncHandler(async (req, res) => {
  const { keyword } = req.query

  let query = {}

  if (keyword) {
    if (!isNaN(keyword)) {
      query.price = Number(keyword)
    } else {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ]
    }
  }
  const drugs = await Drug.find(query)
  if (drugs.length > 0) {
    await Promise.all(
      drugs.map((drug) => {
        drug.lastSearched = new Date()
        return drug.save()
      })
    )

    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res.status(404).json({ success: false, message: "No drugs found" })
  }
})

const getRecentSearches = asyncHandler(async (req, res) => {
  const drugs = await Drug.find().sort({ lastSearched: -1 }).limit(4)

  if (drugs.length > 0) {
    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res
      .status(404)
      .json({ success: false, message: "No recently searched drugs found" })
  }
})

// delete drug
const removeDrug = asyncHandler(async (req, res) => {
  const { id: _id } = req.params
  const drug = await Drug.findOneAndDelete({ _id })

  if (!drug) {
    return res.status(404).json({ message: "Drug not found" })
  }
  fs.unlink(`uploads/${drug.image}`, (err) => {
    if (err) {
      console.error("Error deleting image file:", err)
      return res.status(500).json({ message: "Failed to delete image file" })
    }
  })
  res
    .status(200)
    .json({ message: "Drug and associated image deleted successfully" })
})

// update drug
const updateDrug = asyncHandler(async (req, res) => {
  const { id } = req.params
  const drug = await Drug.findById(id)

  if (!drug) {
    res.status(404)
    throw new Error("Drug not found")
  }

  drug.name = req.body.name || drug.name
  drug.description = req.body.description || drug.description
  drug.category = req.body.category || drug.category
  drug.price = req.body.price || drug.price
  drug.newPrice = req.body.newPrice || drug.newPrice
  drug.quantity = req.body.quantity || drug.quantity
  drug.dosageForm = req.body.dosageForm || drug.dosageForm
  drug.activeIngredients = req.body.activeIngredients || drug.activeIngredients
  drug.storageInstructions =
    req.body.storageInstructions || drug.storageInstructions
  drug.usage = req.body.usage || drug.usage
  drug.location = req.body.location || drug.location
  drug.available = req.body.available || drug.available
  drug.popular = req.body.popular || drug.popular
  drug.caution = req.body.caution || drug.caution

  if (req.file) {
    if (drug.image) {
      fs.unlink(`uploads/${drug.image}`, (err) => {
        if (err) console.error("Error deleting old image:", err)
      })
    }
    drug.image = req.file.filename
  }

  await drug.save()

  res.status(200).json({
    success: true,
    message: "Drug updated successfully",
  })
})

// Filter drugs by category
const getDrugsByCategory = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, sort } = req.query

  if (!category) {
    return res
      .status(400)
      .json({ success: false, message: "Category is required" })
  }

  let query = {
    category: { $regex: category, $options: "i" },
  }

  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }

  let sortBy = {}
  if (sort) {
    if (sort === "priceAsc") {
      sortBy.price = 1
    } else if (sort === "priceDesc") {
      sortBy.price = -1
    } else if (sort === "nameAsc") {
      sortBy.name = 1
    } else if (sort === "nameDesc") {
      sortBy.name = -1
    }
  }

  const drugs = await Drug.find(query).sort(sortBy)

  if (drugs.length > 0) {
    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res
      .status(404)
      .json({ success: false, message: "No drugs found for this category" })
  }
})


// Recently Added Drugs
const getRecentlyAddedDrugs = asyncHandler(async (req, res) => {
  const limit = 10
  const drugs = await Drug.find().sort({ createdAt: -1 }).limit(limit)

  if (drugs.length > 0) {
    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res
      .status(404)
      .json({ success: false, message: "No recently added drugs found" })
  }
})

// Popular drugs
const getPopularDrugs = asyncHandler(async (req, res) => {
  const drugs = await Drug.find({ popular: true })

  if (drugs.length > 0) {
    res.status(200).json({ success: true, nHits: drugs.length, drugs })
  } else {
    res.status(404).json({ success: false, message: "No popular drugs found" })
  }
})

export {
  addDrug,
  getAllDrugs,
  removeDrug,
  getDrug,
  searchDrugs,
  getRecentSearches,
  updateDrug,
  getDrugsByCategory,
  getRecentlyAddedDrugs,
  getPopularDrugs,
}
