import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import Manual from "../models/Manual.js";
import ApiError from "../utils/ApiError.js";
import { extractTextFromPdf } from "../services/pdfService.js";
import { chunkPages } from "../services/chunkService.js";
import { embedBatch } from "../services/geminiService.js";
import { upsertVectors, deleteNamespace } from "../services/pineconeService.js";

/**
 * Runs the full ingestion pipeline for a manual in the background:
 * extract -> chunk -> embed -> upsert to Pinecone -> mark ready.
 * Any failure marks the manual as "failed" with an error message rather
 * than throwing, since this runs after the HTTP response has been sent.
 */
async function processManualAsync(manualId, filePath) {
  try {
    const manual = await Manual.findById(manualId);
    if (!manual) return;

    const { pageCount, pages } = await extractTextFromPdf(filePath);
    const chunks = chunkPages(pages);

    if (chunks.length === 0) {
      manual.status = "failed";
      manual.errorMessage = "No extractable text found in this PDF (it may be a scanned image).";
      await manual.save();
      return;
    }

    const vectors = await embedBatch(chunks.map((c) => c.text));

    const pineconeVectors = chunks.map((chunk, i) => ({
      id: `${manual._id}-${chunk.chunkIndex}`,
      values: vectors[i],
      metadata: {
        manualId: String(manual._id),
        manualTitle: manual.title,
        page: chunk.page,
        text: chunk.text,
      },
    }));

    await upsertVectors(manual.pineconeNamespace, pineconeVectors);

    manual.pageCount = pageCount;
    manual.chunkCount = chunks.length;
    manual.status = "ready";
    await manual.save();
  } catch (err) {
    console.error(`[Manual Processing] Failed for ${manualId}:`, err.message);
    await Manual.findByIdAndUpdate(manualId, {
      status: "failed",
      errorMessage: err.message,
    });
  }
}

/**
 * @route POST /api/manuals/upload
 * @access Private
 */
export const uploadManual = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "A PDF file is required");

  const { title, brand, model, manualType } = req.body;

  const manual = await Manual.create({
    uploadedBy: req.user._id,
    title: title || path.parse(req.file.originalname).name,
    brand: brand || "",
    model: model || "",
    manualType: manualType || "other",
    originalFilename: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileSizeBytes: req.file.size,
    pineconeNamespace: `manual-${uuidv4()}`,
    status: "processing",
  });

  // Kick off ingestion without blocking the response
  processManualAsync(manual._id, req.file.path);

  res.status(202).json({
    success: true,
    message: "Manual uploaded and is being processed. This may take a minute.",
    manual,
  });
});

/**
 * @route GET /api/manuals
 * @access Private
 */
export const getMyManuals = asyncHandler(async (req, res) => {
  const manuals = await Manual.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: manuals.length, manuals });
});

/**
 * @route GET /api/manuals/:id
 * @access Private
 */
export const getManualById = asyncHandler(async (req, res) => {
  const manual = await Manual.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!manual) throw new ApiError(404, "Manual not found");
  res.status(200).json({ success: true, manual });
});

/**
 * @route DELETE /api/manuals/:id
 * @access Private
 */
export const deleteManual = asyncHandler(async (req, res) => {
  const manual = await Manual.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!manual) throw new ApiError(404, "Manual not found");

  await deleteNamespace(manual.pineconeNamespace);
  await manual.deleteOne();

  res.status(200).json({ success: true, message: "Manual deleted" });
});
