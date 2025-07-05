import express, { Request, Response } from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from 'url';
import "./configs/passport.js";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.route.js";
import careerRoutes from "./routes/career.route.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/career', careerRoutes);

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    message: "Job Ready AI Coach API is running successfully!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "POST /auth/signup",
        login: "POST /auth/login",
        google: "GET /auth/google",
        profile: "GET /auth/me",
        logout: "POST /auth/logout",
        verifyEmail: "POST /auth/verify-email",
        forgotPassword: "POST /auth/forgot-password",
        resetPassword: "POST /auth/reset-password",
        changePassword: "POST /auth/change-password"
      },
      profile: {
        get: "GET /profile",
        status: "GET /profile/status",
        update: "PUT /profile",
        uploadAvatar: "POST /profile/avatar",
        delete: "DELETE /profile"
      },
      career: {
        generatePath: "POST /career/generate-path",
        getResources: "GET /career/resources",
        analyzeSkills: "POST /career/analyze-skills",
        savePath: "POST /career/save-path",
        getSavedPath: "GET /career/saved-path"
      }
    }
  });
});

// 404 handler
app.use('*', notFound);

// Error handling middleware
app.use(errorHandler);

// DB connection and server start
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();