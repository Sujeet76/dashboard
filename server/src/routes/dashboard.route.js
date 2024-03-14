import express from "express";

const router = express.Router();

// controllers
import {
  getAllData,
  intensityBySector,
  intensityTrendByTime,
  likelihoodByTopic,
  relevanceByRegion,
  topCountryByInsights,
  impactOnWorldBySector,
  sourceDistributionBySector,
  topSectorPerCountry,
} from "../controllers/dashboard.controller.js";

router.route("/all").get(getAllData);
router.route("/intensity-by-sector").get(intensityBySector);
router.route("/likelihood-by-topic").get(likelihoodByTopic);
router.route("/relevance-by-region").get(relevanceByRegion);
router.route("/intensity-trend-by-time").get(intensityTrendByTime);
router.route("/top-countries-insights").get(topCountryByInsights);
router.route("/source-distribution-by-sector").get(sourceDistributionBySector);
router.route("/impact-by-sector").get(impactOnWorldBySector);
router.route("/top-sector-per-country").get(topSectorPerCountry);

export default router;
