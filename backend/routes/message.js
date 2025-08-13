import express from "express"; 
import { MessageRepository } from "../repos/MessageRepo.js";

const router = express.Router();

// GET all conversations
router.get("/conversations", async (req, res) => {
  try {
    const grouped = await MessageRepository.findAllGrouped();
    // Convert object to array
    const messagesArray = Object.entries(grouped).map(([wa_id, convo]) => ({
      wa_id,
      ...convo
    }));
    res.json(messagesArray);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET messages for a specific wa_id
router.get("/messages/:wa_id", async (req, res) => {
  try {
    const messages = await MessageRepository.findByWaId(req.params.wa_id);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST send message
router.post("/send", async (req, res) => {
  try {
    const msg = await MessageRepository.create({
      wa_id: req.body.wa_id,
      name: req.body.name || "You",
      message_id: Date.now().toString(),
      text: req.body.text,
      status: "sent",
      timestamp: new Date(),
    });
    req.io.emit("new_message", msg);
    req.io.emit("conversations_updated"); 
    res.json(msg);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;