import express, {Request, Response} from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.get("/" ,(_req:Request, res:Response) => {

  res.send("The backend is running successfully!")

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
}) 