import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    surname: { type: String, required: true },
    firstname: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {type:String},
    contact: {type: String}
  },
  { timestamps: true, collection: "user-data" }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User
