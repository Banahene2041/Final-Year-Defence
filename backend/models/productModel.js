import mongoose from "mongoose"

const drugSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    newPrice: { type: Number },
    quantity: { type: String, required: true },
    dosageForm: { type: String },
    activeIngredients: [{ type: String, required: true }],
    storageInstructions: { type: String },
    usage: [{ type: String }],
    caution: { type: String },
    lastSearched: { type: Date, default: Date.now },
    location: { type: String },
    available: { type: String },
    popular: { type: Boolean, default: false },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "drug-data" }
)

const Drug = mongoose.model("Drug", drugSchema)

export default Drug
