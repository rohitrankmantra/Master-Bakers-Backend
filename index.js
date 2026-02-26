import dotenv from 'dotenv';
dotenv.config(); // MUST be the first thing

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // <-- added
import connectDB from './libs/db.js';
import cartRoutes from './routes/cartRoutes.js'; // <-- added
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { generateUuid } from './middlewares/generateUuid.js'; // <-- added

const app = express();

// Middlewares
// origin list can include Render domain and later custom domains
const allowedOrigins = [
  'http://localhost:3000',
  'https://ecommerce-bakers-layout-2.vercel.app',
  process.env.FRONTEND_URL,          // e.g. https://www.yoursite.com
].filter(Boolean);

// simple debug log showing which origins are allowed (omit in production if you prefer)
console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // allow cookies
}));
app.use(express.json());
app.use(cookieParser()); // <-- needed to read cookies

// Connect to MongoDB
connectDB();

// visitor middlewares 
app.use(generateUuid)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);


// Test route
app.get('/', (req, res) => res.send('Backend is running!'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
