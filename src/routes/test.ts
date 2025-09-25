import dotenv from "dotenv"

dotenv.config()
const data = process.env.DATABASE_URL

console.log(data)