import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

/**
 * Generates an embedding vector for a piece of text.
 * Used both when indexing manual chunks and when embedding a user's query.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export const embedText = async (text) => {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

/**
 * Batch-embeds an array of text chunks. Gemini's embedContent is called
 * per-chunk (the SDK does not currently expose a batch endpoint for all
 * models), but calls are run with limited concurrency to stay within
 * rate limits.
 * @param {string[]} texts
 * @param {number} concurrency
 * @returns {Promise<number[][]>}
 */
export const embedBatch = async (texts, concurrency = 5) => {
  const results = new Array(texts.length);
  let cursor = 0;

  async function worker() {
    while (cursor < texts.length) {
      const i = cursor++;
      results[i] = await embedText(texts[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, texts.length) }, worker);
  await Promise.all(workers);
  return results;
};

/**
 * Sends a RAG-style prompt to Gemini: the retrieved manual context plus
 * the user's question and prior conversation turns, and asks for a
 * structured technical answer.
 * @param {{question: string, context: string, history: {role: string, content: string}[]}} params
 * @returns {Promise<string>}
 */
export const askGeminiWithContext = async ({ question, context, history = [] }) => {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

  const systemInstruction = `You are VoltFix AI, an expert electric-bike service technician assistant.
Answer ONLY using the manual excerpts provided in the context below. If the context does not contain
the answer, say so honestly and suggest what information would help.
Always structure answers as:
1. Direct answer
2. Step-by-step instructions (numbered)
3. Required tools (if any)
4. Safety warnings (if any)
Cite which manual/page each key fact comes from when the context provides that metadata.`;

  const historyText = history
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");

  const prompt = `${systemInstruction}

--- CONVERSATION HISTORY ---
${historyText || "(none)"}

--- MANUAL CONTEXT ---
${context || "(no relevant context found)"}

--- USER QUESTION ---
${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Generic structured-JSON Gemini call used by the Battery Predictor and
 * other features that need a deterministic JSON payload back.
 * @param {string} prompt
 * @returns {Promise<object>}
 */
export const askGeminiForJson = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

export default { embedText, embedBatch, askGeminiWithContext, askGeminiForJson };
