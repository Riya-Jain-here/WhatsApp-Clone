import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import messageRoutes from './routes/message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with multiple allowed origins
const io = new Server(httpServer, {
  cors: {
    origin: ["https://whatsapp-clone-oted.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ["https://whatsapp-clone-oted.onrender.com", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Attach io to requests
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/messages', messageRoutes);

// Socket connection
io.on('connection', (socket) => {
  console.log('WebSocket connected');
});

httpServer.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Server running on port', process.env.PORT || 5000);
});