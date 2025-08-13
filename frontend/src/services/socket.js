import { io } from 'socket.io-client';

const SOCKET_URL = 'https://whatsapp-clone-backend-x0z5.onrender.com';
const socket = io(SOCKET_URL, { transports: ['websocket'] });

export default socket;