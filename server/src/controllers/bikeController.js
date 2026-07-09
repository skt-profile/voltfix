import asyncHandler from "express-async-handler";
import Bike from "../models/Bike.js";
import Battery from "../models/Battery.js";
import ServiceHistory from "../models/ServiceHistory.js";
import ApiError from "../utils/ApiError.js";

/**
 * @route POST /api/bikes
 * @access Private
 */
export const createBike = asyncHandler(async (req, res) => {
  const { brand, model, vin, color, motorType, motorPowerWatts, mileageKm, purchaseDate, warrantyExpiresAt, notes } =
    req.body;

  if (!brand || !model || !vin) {
    throw new ApiError(400, "Brand, model, and VIN are required");
  }

  const bike = await Bike.create({
    owner: req.user._id,
    brand,
    model,
    vin,
    color,
    motorType,
    motorPowerWatts,
    mileageKm,
    purchaseDate,
    warrantyExpiresAt,
    notes,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
  });

  // Auto-create a linked battery record with sensible defaults
  const battery = await Battery.create({
    bike: bike._id,
    owner: req.user._id,
  });
  bike.battery = battery._id;
  await bike.save();

  res.status(201).json({ success: true, bike });
});

/**
 * @route GET /api/bikes
 * @access Private
 */
export const getMyBikes = asyncHandler(async (req, res) => {
  const bikes = await Bike.find({ owner: req.user._id })
    .populate("battery")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: bikes.length, bikes });
});

/**
 * @route GET /api/bikes/:id
 * @access Private
 */
export const getBikeById = asyncHandler(async (req, res) => {
  const bike = await Bike.findOne({ _id: req.params.id, owner: req.user._id }).populate("battery");
  if (!bike) throw new ApiError(404, "Bike not found");

  const serviceHistory = await ServiceHistory.find({ bike: bike._id }).sort({ serviceDate: -1 });

  res.status(200).json({ success: true, bike, serviceHistory });
});

/**
 * @route PUT /api/bikes/:id
 * @access Private
 */
export const updateBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bike) throw new ApiError(404, "Bike not found");

  const editableFields = [
    "brand",
    "model",
    "vin",
    "color",
    "motorType",
    "motorPowerWatts",
    "mileageKm",
    "purchaseDate",
    "warrantyExpiresAt",
    "status",
    "notes",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) bike[field] = req.body[field];
  });

  if (req.file) {
    bike.imageUrl = `/uploads/${req.file.filename}`;
  }

  await bike.save();
  res.status(200).json({ success: true, bike });
});

/**
 * @route DELETE /api/bikes/:id
 * @access Private
 */
export const deleteBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bike) throw new ApiError(404, "Bike not found");

  await Battery.deleteMany({ bike: bike._id });
  await ServiceHistory.deleteMany({ bike: bike._id });
  await bike.deleteOne();

  res.status(200).json({ success: true, message: "Bike deleted" });
});

/**
 * @route GET /api/bikes/summary/dashboard
 * @access Private
 * Aggregated stats used by the dashboard cards/charts.
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const bikes = await Bike.find({ owner: req.user._id }).populate("battery");

  const totalBikes = bikes.length;
  const totalMileage = bikes.reduce((sum, b) => sum + (b.mileageKm || 0), 0);
  const avgBatteryHealth =
    bikes.length > 0
      ? Math.round(
          bikes.reduce((sum, b) => sum + (b.battery?.lastPrediction?.healthPercent || 0), 0) / bikes.length
        )
      : 0;

  const upcomingServices = await ServiceHistory.find({
    owner: req.user._id,
    nextDueDate: { $gte: new Date() },
  })
    .sort({ nextDueDate: 1 })
    .limit(5)
    .populate("bike", "brand model");

  res.status(200).json({
    success: true,
    summary: {
      totalBikes,
      totalMileage,
      avgBatteryHealth,
      inService: bikes.filter((b) => b.status === "in_service").length,
      upcomingServices,
      bikes: bikes.map((b) => ({
        id: b._id,
        brand: b.brand,
        model: b.model,
        mileageKm: b.mileageKm,
        status: b.status,
        batteryHealth: b.battery?.lastPrediction?.healthPercent ?? null,
      })),
    },
  });
});
