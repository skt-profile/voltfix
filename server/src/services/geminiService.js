import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// ===== DEBUG START =====
console.log("====================================");
console.log("Gemini Debug");
console.log("====================================");
console.log(
  "GEMINI_API_KEY exists:",
  !!process.env.GEMINI_API_KEY
);

if (process.env.GEMINI_API_KEY) {
  console.log(
    "GEMINI_API_KEY starts with:",
    process.env.GEMINI_API_KEY.substring(0, 10)
  );

  console.log(
    "GEMINI_API_KEY length:",
    process.env.GEMINI_API_KEY.length
  );
} else {
  console.log("GEMINI_API_KEY is NOT loaded");
}

console.log("====================================");
// ===== DEBUG END =====

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ||
  "gemini-2.5-flash";

const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ||
  "gemini-embedding-001";

/**
 * Generates a 768 dimension embedding vector.
 * Pinecone index dimension must be 768.
 */
export const embedText = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: EMBEDDING_MODEL,
    });

    const result = await model.embedContent({
      content: {
        role: "user",
        parts: [
          {
            text: String(text),
          },
        ],
      },

      outputDimensionality: 768,
    });

    const values = result.embedding.values;

    console.log(
      "[Gemini Embedding] Dimension:",
      values.length
    );

    if (values.length !== 768) {
      throw new Error(
        `Embedding dimension mismatch. Expected 768 but received ${values.length}`
      );
    }

    return values;
  } catch (error) {
    console.error(
      "[Gemini Embedding Error]:",
      error.message
    );

    throw error;
  }
};

/**
 * Batch embedding
 */
export const embedBatch = async (
  texts,
  concurrency = 5
) => {
  const results = new Array(texts.length);

  let cursor = 0;

  async function worker() {
    while (cursor < texts.length) {
      const i = cursor++;

      results[i] = await embedText(
        texts[i]
      );
    }
  }

  const workerCount = Math.min(
    concurrency,
    texts.length
  );

  const workers = Array.from(
    {
      length: workerCount,
    },
    () => worker()
  );

  await Promise.all(workers);

  return results;
};

/**
 * Chat with RAG context
 */
export const askGeminiWithContext = async ({
  question,
  context,
  history = [],
}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: CHAT_MODEL,
    });

    const systemInstruction = `
You are VoltFix AI.

You are an expert electric bike service,
diagnostics and maintenance assistant.

You must answer ONLY using the manual
context provided.

If the manual context does not contain
the answer, clearly say:

"I could not find this information in
the uploaded service manual."

Always structure answers as:

1. Direct Answer

2. Step-by-Step Instructions

3. Required Tools

4. Safety Warnings

5. Manual Reference

Provide clear technical instructions
for electric bike technicians.

Do not invent technical information.
`;

    const historyText = history
      .map(
        (h) =>
          `${
            h.role === "user"
              ? "User"
              : "Assistant"
          }: ${h.content}`
      )
      .join("\n");

    const prompt = `
${systemInstruction}

================================
CONVERSATION HISTORY
================================

${historyText || "(none)"}

================================
SERVICE MANUAL CONTEXT
================================

${context || "(no relevant context found)"}

================================
TECHNICIAN QUESTION
================================

${question}
`;

    const result =
      await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error(
      "[Gemini Chat Error]:",
      error.message
    );

    throw error;
  }
};

/**
 * Structured JSON Gemini response
 */
export const askGeminiForJson = async (
  prompt
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: CHAT_MODEL,

      generationConfig: {
        responseMimeType:
          "application/json",
      },
    });

    const result =
      await model.generateContent(prompt);

    const text =
      result.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error(
      "[Gemini JSON Error]:",
      error.message
    );

    throw error;
  }
};

export default {
  embedText,
  embedBatch,
  askGeminiWithContext,
  askGeminiForJson,
};