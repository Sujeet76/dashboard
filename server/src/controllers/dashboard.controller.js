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

const intensityTrendByTime = asyncHandler(async (req, res) => {
  try {
    const intensityTrend = await Data.aggregate([
      // match the data which has added or published date
      {
        $match: {
          $or: [{ added: { $exists: true }, published: { $exists: true } }],
        },
      },
      // project the date (may be added or published date) and intensity
      {
        $project: {
          date: { $ifNull: ["$added", "$published"] },
          intensity: 1,
          _id: 0,
        },
      },
      // overwrite the date field with date object of previous pipeline result have date
      {
        $addFields: {
          date: {
            // convert string to date object
            $dateFromString: {
              dateString: "$date",
              format: "%B, %d %Y %H:%M:%S",
            },
          },
        },
      },
      {
        // group the data by date and calculate the average intensity
        $group: {
          _id: "$date",
          avgIntensity: { $avg: "$intensity" },
        },
      },
      {
        // sort the data by date
        $sort: { _id: 1 },
      },
      {
        // project only desired fields and format the date
        $project: {
          date: {
            // convert date object to string
            $dateToString: {
              format: "%B, %d %Y %H:%M:%S",
              date: "$_id",
            },
          },
          avgIntensity: 1,
        },
      },
    ]);

    if (intensityTrend.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    // Handel null cases
    const formattedData = intensityTrend.filter(
      (data) => data._id !== null && data.avgIntensity !== null
    );

    res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting intensityTrend : ", error);
    throw new ApiError(500, "Something went wrong in intensityTrend", error);
  }
});

// top-countries-insights
const topCountryByInsights = asyncHandler(async (req, res) => {
  try {
    const topCountry = await Data.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          country: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    if (topCountry.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    //handel  null or empty country name
    const formattedData = topCountry.filter(
      (data) => data.country !== null && data.country !== ""
    );

    res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting topCountry : ", error);
    throw new ApiError(500, "Something went wrong in topCountry", error);
  }
});

// impact on world by pre sector
const impactOnWorldBySector = asyncHandler(async (req, res) => {
  try {
    const impactOnWorld = await Data.aggregate([
      {
        $group: {
          _id: "$sector",
          totalImpact: {
            $sum: "$impact",
          },
        },
      },
    ]);

    if (impactOnWorld.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, impactOnWorld, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting impactOnWorldBySector : ", error);
    throw new ApiError(500, "Something went wrong in impactOnWorldBySector");
  }
});

// source-distribution-by-sector
const sourceDistributionBySector = asyncHandler(async (req, res) => {
  try {
    const sourceDistribution = await Data.aggregate([
      {
        $group: {
          _id: { sector: "$sector", source: "$source" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.sector",
          sources: { $push: { source: "$_id.source", count: "$count" } },
        },
      },
    ]);

    if (sourceDistribution.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, sourceDistribution, "Data retrieved successfully")
      );
  } catch (error) {
    console.log("Error while getting sourceDistribution : ", error);
    throw new ApiError(500, "Something went wrong in sourceDistribution");
  }
});

// top sector pre country
const topSectorPerCountry = asyncHandler(async (req, res) => {
  try {
    const topSector = await Data.aggregate([
      {
        $group: {
          _id: { country: "$country", sector: "$sector" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.country": 1,
          count: -1,
        },
      },
      {
        $group: {
          _id: "$_id.country",
          sector: { $first: "$_id.sector" },
        },
      },
    ]);

    if (topSector.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "No data found"));
    }

    // Handel null and empty case
    const formattedData = topSector.filter(
      (d) => d.sector !== "" && d["_id"] !== ""
    );

    return res
      .status(200)
      .json(new ApiResponse(200, formattedData, "Data retrieved successfully"));
  } catch (error) {
    console.log("Error while getting topSectorPerCountry : ", error);
    throw new ApiError(500, "Something went wrong in topSectorPerCountry");
  }
});

export {
  getAllData,
  intensityBySector,
  likelihoodByTopic,
  relevanceByRegion,
  intensityTrendByTime,
  topCountryByInsights,
  impactOnWorldBySector,
  sourceDistributionBySector,
  topSectorPerCountry,
};
