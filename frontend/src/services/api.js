import axios from 'axios';
//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/messages';
const API_BASE_URL = 'https://whatsapp-clone-backend-x0z5.onrender.com/api/messages';
const API = axios.create({ baseURL: API_BASE_URL  });
// Get list of chats
export const getConversations = () => API.get('/conversations');

// Get messages for one chat
export const getMessages = (wa_id) => API.get(`/messages/${wa_id}`);

// Send new message
export const sendMessage = (data) => API.post('/send', data);

export default API;