import fs from "fs";
import path from "path";
import { MessageRepository } from "../repos/MessageRepo.js";

export const WebhookProcessorService = {
  processPayloadFile: async (filePath) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (data.type === "message") {
      await MessageRepository.create({
        wa_id: data.wa_id,
        name: data.name,
        message_id: data.message_id,
        meta_msg_id: data.meta_msg_id,
        text: data.text,
        status: data.name === "You" ? (data.status || "sent") : data.status || null,
        timestamp: new Date(data.timestamp * 1000),
      });
      return;
    }

    if (data.type === "status") {
      await MessageRepository.updateStatusById(data.message_id, data.status).catch((e) =>
        console.error("status update failed", e)
      );
      return;
    }

    // --- WhatsApp webhook payload ---
    if (data.payload_type === "whatsapp_webhook") {
      try {
        const change = data.metaData.entry[0].changes[0].value;

        const businessNumber =
          process.env.MY_WA_ID ||
          change.metadata?.display_phone_number ||
          change.metadata?.phone_number_id ||
          null;

        // 1) Process message objects
        if (change.messages && change.contacts) {
          const contact = change.contacts[0];
          const message = change.messages[0];

          const isFromMe =
            (message.from && businessNumber && message.from === businessNumber) ||
            !!message.from_me;

          if (message.type === "text") {
            const finalStatus = isFromMe
              ? message.status || "sent" // use given status if provided, else "sent"
              : message.status || null;

            await MessageRepository.create({
              wa_id: contact.wa_id,
              name: isFromMe ? "You" : contact.profile?.name || contact.wa_id || "Unknown",
              message_id: message.id,
              meta_msg_id: message.context?.id || null,
              text: message.text?.body || "",
              status: finalStatus,
              timestamp: new Date(Number(message.timestamp) * 1000),
            });
          }
        }

        // 2) Process status updates
        if (change.statuses) {
          for (const status of change.statuses) {
            const msgId = status.id || null;
            const metaId = status.meta_msg_id || null;
            const newStatus = status.status;
            const recipient = status.recipient_id || null;

            const msg = await MessageRepository.findByIdOrMetaId(msgId, metaId);

            if (msg) {
              if (msg.name === "You") {
                await MessageRepository.updateStatusById(
                  msg.message_id || msg.meta_msg_id || msg._id,
                  newStatus
                );
              }
            } else {
              await MessageRepository.create({
                wa_id: recipient || null,
                name: "You",
                message_id: msgId,
                meta_msg_id: metaId,
                text: "",
                status: newStatus,
                timestamp: status.timestamp
                  ? new Date(Number(status.timestamp) * 1000)
                  : new Date(),
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error processing WhatsApp payload in ${filePath}`, err);
      }
    }
  },

  processPayloadDirectory: async (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      await WebhookProcessorService.processPayloadFile(path.join(dir, file));
    }
  },
};