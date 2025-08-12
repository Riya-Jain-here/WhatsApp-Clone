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
const io = new Server(httpServer, { cors: { origin: '*' } });

connectDB();

app.use(cors());
app.use(express.json());

// Attach io to requests
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
  console.log('WebSocket connected');
});

httpServer.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Server running on port', process.env.PORT || 5000);
});
