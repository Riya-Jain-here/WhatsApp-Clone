import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { WebhookProcessorService } from './services/WebhookProcessorService.js';

dotenv.config();

(async () => {
  await connectDB();
  await WebhookProcessorService.processPayloadDirectory('./payloads');
  console.log('Payload processing complete');
  process.exit(0);
})();
