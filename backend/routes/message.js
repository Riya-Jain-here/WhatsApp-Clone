import express from "express";
import { MessageRepository } from "../repos/MessageRepo.js";

const router = express.Router();

router.get("/conversations", async (req, res) => {
  res.json(await MessageRepository.findAllGrouped());
});

router.get("/messages/:wa_id", async (req, res) => {
  res.json(await MessageRepository.findByWaId(req.params.wa_id));
});

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
