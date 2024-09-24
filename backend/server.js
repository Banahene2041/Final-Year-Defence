import express from "express"
const app = express()
import dotenv from "dotenv"
dotenv.config()
const PORT = process.env.PORT || 5000
import userRoutes from "./routes/userRoutes.js"
import drugRoutes from './routes/drugRoutes.js'
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
import connectDB from "./db/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(corsOptions))

// api endpoints
// user route
app.use("/api/users", userRoutes)
// drugRoute
app.use('/api/drug',drugRoutes)
app.use('/images',express.static('uploads'))

app.get("/", (req, res) => res.send("Server is ready"))

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(
      PORT,
      console.log(`Server is listening on http://localhost:${PORT}`)
    )
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
start()
