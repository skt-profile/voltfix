import express from "express";
import {
  uploadManual,
  getMyManuals,
  getManualById,
  deleteManual,
} from "../controllers/manualController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadManualPdf } from "../middleware/uploadMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);

router.post("/upload", aiLimiter, uploadManualPdf.single("manual"), uploadManual);
router.get("/", getMyManuals);
router.get("/:id", getManualById);
router.delete("/:id", deleteManual);

export default router;
