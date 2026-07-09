import express from "express";
import {
  createBike,
  getMyBikes,
  getBikeById,
  updateBike,
  deleteBike,
  getDashboardSummary,
} from "../controllers/bikeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary/dashboard", getDashboardSummary);
router.route("/").get(getMyBikes).post(uploadImage.single("image"), createBike);
router
  .route("/:id")
  .get(getBikeById)
  .put(uploadImage.single("image"), updateBike)
  .delete(deleteBike);

export default router;
