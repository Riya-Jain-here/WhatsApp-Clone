import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  wa_id: String,
  name: String,
  message_id: String,
  meta_msg_id: String,
  text: String,
  status: { type: String, default: 'sent' },
  timestamp: Date,
}, { timestamps: true,
    collection: 'processed_messages'
 });

export default mongoose.model('Message', messageSchema);
