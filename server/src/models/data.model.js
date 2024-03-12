import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
  end_year: {
    type: Number,
  },
  intensity: {
    type: Number,
  },
  sector: {
    type: String,
  },
  topic: {
    type: String,
  },
  insight: {
    type: String,
  },
  url: {
    type: String,
    required: [true, "Url is required field"],
  },
  region: {
    type: String,
  },
  start_year: {
    type: Number,
  },
  impact: {
    type: Number,
  },
  added: {
    type: String,
    required: [true, "Added date is required field"],
  },
  published: {
    type: String,
  },
  country: {
    type: String,
  },
  relevance: {
    type: Number,
  },
  pestel: {
    type: String,
  },
  title: {
    type: String,
    required: [true, "Title is required field"],
  },
  likelihood: {
    type: Number,
  },
});

const Data = mongoose.models.Data || mongoose.model("Data", dataSchema);

export { Data };
