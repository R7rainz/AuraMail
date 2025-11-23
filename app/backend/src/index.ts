import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from 'database'

const app = express()
const PORT = process.env.PORT || 3001

//middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

//routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString()})
})

app.get("/api/users", async (req, res) => {
  try{
    const user = await prisma.user.findMany();
    res.json(user);
  }
  catch(error){
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error"})
  }
})

app.post("/api/users", async (req, res) => {
  try{
    const { email, name, provider = "manual" } = req.body;
    const user = await prisma.user.create({
      data: {email, name, provider}
    })
    res.json(user)
  } catch(error){
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error"})
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
