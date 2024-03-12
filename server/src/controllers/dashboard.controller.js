import { asyncHandler } from "../utils/asyncHandler.js";
import { Data } from "../models/data.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllData = asyncHandler(async (req, res) => {
  const data = await Data.find({});
  res
    .status(200)
    .json(new ApiResponse(200, data, "Data retrieved successfully"));
});

const intensityBySector = asyncHandler(async (req, res) => {
  try {
    const intensityPerSector = await Data.aggregate([
      {
        $group: {
          _id: "$sector",
          avgIntensity: {
            $avg: { $sum: "$intensity" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    if (intensityPerSector.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    // formate the data
    const formattedData = intensityPerSector.map((sectorData) => ({
      sector: !sectorData._id ? "unknown" : sectorData._id,
      averageIntensity: Math.round(sectorData.avgIntensity),
      count: sectorData.count,
    }));

    res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting intensityBySector : ", error);
    throw new ApiError(500, "Something went wrong in intensityBySector", error);
  }
});

// Path: server/src/controllers/dashboard.controller.js
// it return data for visualization of likelihood by topic mean it tell the probability of occurrence of a topic
const likelihoodByTopic = asyncHandler(async (req, res) => {
  try {
    const likelihoodDistribution = await Data.aggregate([
      {
        $group: {
          _id: "$likelihood",
          averageLikelihood: { $avg: "$likelihood" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          topic: "$_id",
          averageLikelihood: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    if (likelihoodDistribution.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    // handel case when likelihood is null
    const formattedData = likelihoodDistribution.filter(
      (data) => data.topic !== ""
    );

    res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting likelihoodDistribution : ", error);
    throw new ApiError(
      500,
      "Something went wrong in likelihoodDistribution",
      error
    );
  }
});

const relevanceByRegion = asyncHandler(async (req, res) => {
  try {
    const relevanceDistribution = await Data.aggregate([
      {
        $group: {
          _id: "$region",
          averageRelevance: { $avg: "$relevance" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          region: "$_id",
          averageRelevance: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    if (relevanceDistribution.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    // handel case when relevance is null
    const formattedData = relevanceDistribution.filter(
      (data) => data.region !== ""
    );

    res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting relevanceDistribution : ", error);
    throw new ApiError(
      500,
      "Something went wrong in relevanceDistribution",
      error
    );
  }
});

export { getAllData, intensityBySector, likelihoodByTopic, relevanceByRegion };
