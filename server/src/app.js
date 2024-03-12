import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// if in future we need
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// routes
import dashboardRoutes from "./routes/dashboard.route.js";

app.use("/api/v1/dashboard", dashboardRoutes);

export { app };
