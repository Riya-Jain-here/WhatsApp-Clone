import Message from "../models/Message.js";

const STATUS_PRIORITY = {
  sent: 1,
  delivered: 2,
  read: 3,
};

export const MessageRepository = {
  create: (data) => Message.create(data),

  findByWaId: (wa_id) => Message.find({ wa_id }).sort({ timestamp: 1 }),

  findAllGrouped: async () => {
    // Fetch all messages sorted by timestamp descending (newest first)
    const messages = await Message.find().sort({ timestamp: -1 });

    const grouped = {};

    messages.forEach((msg) => {
      if (!grouped[msg.wa_id]) {
        grouped[msg.wa_id] = {
          messages: [],
          latestMessage: msg, // first message in descending order is latest
        };
      }
      // Insert messages at the front to keep ascending order inside groups
      grouped[msg.wa_id].messages.unshift(msg);
    });

    return grouped;
  },

  findByIdOrMetaId: async (msgId, metaId = null) => {
    const ors = [];
    if (msgId) {
      ors.push({ message_id: msgId }, { meta_msg_id: msgId });
    }
    if (metaId) {
      ors.push({ message_id: metaId }, { meta_msg_id: metaId });
    }
    if (ors.length === 0) return null;
    return Message.findOne({ $or: ors });
  },

  updateStatusById: async (msgId, newStatus, io = null) => {
    const msg = await Message.findOne({ $or: [{ message_id: msgId }, { meta_msg_id: msgId }] });

    if (!msg) return null;

    // Only update if the new status has higher priority
    if (!msg.status || STATUS_PRIORITY[newStatus] > STATUS_PRIORITY[msg.status]) {
      msg.status = newStatus;
      msg.updated_at = new Date();
      await msg.save();

      if (io) io.emit("status_update", msg);
    }

    return msg;
  },

  updateById: async (id, patch, io = null) => {
    const updated = await Message.findByIdAndUpdate(id, patch, { new: true });
    if (updated && io) io.emit("status_update", updated);
    return updated;
  }
};