import express, { Request, Response } from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import "./configs/passport.js"; // Ensure passport is configured
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)

// DB connection
connectDB();

app.get("/", (_req: Request, res: Response) => {
  res.send("The backend is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
