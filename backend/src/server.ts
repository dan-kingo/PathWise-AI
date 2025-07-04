import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// DB connection
connectDB();

app.get("/", (_req: Request, res: Response) => {
  res.send("The backend is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
