import asyncHandler from "express-async-handler";
import Manual from "../models/Manual.js";
import Conversation from "../models/Conversation.js";
import ApiError from "../utils/ApiError.js";
import { embedText, askGeminiWithContext } from "../services/geminiService.js";
import { queryNamespace, queryMultipleNamespaces } from "../services/pineconeService.js";

const MAX_HISTORY_TURNS = 6;

/**
 * @route POST /api/chat/:conversationId?
 * @body { question: string, manualId?: string }
 * @access Private
 *
 * If conversationId is omitted, a new conversation is created.
 * If manualId is provided, search is scoped to that manual only;
 * otherwise it searches across all of the user's ready manuals.
 */
export const askQuestion = asyncHandler(async (req, res) => {
  const { question, manualId } = req.body;
  const { conversationId } = req.params;

  if (!question || !question.trim()) {
    throw new ApiError(400, "A question is required");
  }

  // Resolve or create the conversation
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
    if (!conversation) throw new ApiError(404, "Conversation not found");
  } else {
    conversation = await Conversation.create({
      user: req.user._id,
      manual: manualId || null,
      title: question.slice(0, 60),
      messages: [],
    });
  }

  // Determine which Pinecone namespace(s) to search
  let namespaces = [];
  if (manualId) {
    const manual = await Manual.findOne({ _id: manualId, uploadedBy: req.user._id, status: "ready" });
    if (!manual) throw new ApiError(404, "Manual not found or not yet processed");
    namespaces = [manual.pineconeNamespace];
  } else {
    const manuals = await Manual.find({ uploadedBy: req.user._id, status: "ready" });
    if (manuals.length === 0) {
      throw new ApiError(400, "Upload and process at least one manual before asking questions");
    }
    namespaces = manuals.map((m) => m.pineconeNamespace);
  }

  // Embed the question and retrieve relevant chunks
  const queryVector = await embedText(question);
  const matches =
    namespaces.length === 1
      ? await queryNamespace(namespaces[0], queryVector, 6)
      : await queryMultipleNamespaces(namespaces, queryVector, 4, 8);

  const context = matches
    .map((m, i) => `[Source ${i + 1} | ${m.metadata.manualTitle} | Page ${m.metadata.page}]\n${m.metadata.text}`)
    .join("\n\n");

  const recentHistory = conversation.messages.slice(-MAX_HISTORY_TURNS).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const answer = await askGeminiWithContext({ question, context, history: recentHistory });

  const sources = matches.map((m) => ({
    manual: m.metadata.manualId,
    manualTitle: m.metadata.manualTitle,
    page: m.metadata.page,
    snippet: m.metadata.text.slice(0, 240),
    score: m.score,
  }));

  conversation.messages.push({ role: "user", content: question });
  conversation.messages.push({ role: "assistant", content: answer, sources });
  await conversation.save();

  res.status(200).json({
    success: true,
    conversationId: conversation._id,
    answer,
    sources,
  });
});

/**
 * @route GET /api/chat
 * @access Private
 */
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id })
    .select("title manual createdAt updatedAt")
    .sort({ updatedAt: -1 });
  res.status(200).json({ success: true, conversations });
});

/**
 * @route GET /api/chat/:conversationId
 * @access Private
 */
export const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  res.status(200).json({ success: true, conversation });
});

/**
 * @route DELETE /api/chat/:conversationId
 * @access Private
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  await conversation.deleteOne();
  res.status(200).json({ success: true, message: "Conversation deleted" });
});
