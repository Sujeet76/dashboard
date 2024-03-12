import express from "express";

const router = express.Router();

// controllers
import {
  getAllData,
  intensityBySector,
  likelihoodByTopic,
  relevanceByRegion,
} from "../controllers/dashboard.controller.js";

router.route("/all").get(getAllData);
router.route("/intensity-by-sector").get(intensityBySector);
router.route("/likelihood-by-topic").get(likelihoodByTopic);
router.route("/relevance-by-region").get(relevanceByRegion);

export default router;
