import express from "express";
import {
  askQuestion,
  getMyConversations,
  getConversationById,
  deleteConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyConversations);
router.post("/", aiLimiter, askQuestion); // new conversation
router.post("/:conversationId", aiLimiter, askQuestion); // continue conversation
router.get("/:conversationId", getConversationById);
router.delete("/:conversationId", deleteConversation);

export default router;
