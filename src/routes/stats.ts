import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.js";

const app = express.Router();

// route - /api/v1/dashboard/stats
app.get("/stats", adminOnly,(req, res, next) => {
  getDashboardStats(req, res, next).catch(next);
});

// route - /api/v1/dashboard/pie
app.get("/pie", adminOnly, (req, res, next) => {
  getPieCharts(req, res, next).catch(next);
});

// route - /api/v1/dashboard/bar
app.get("/bar", adminOnly, (req, res, next) => {
  getBarCharts(req, res, next).catch(next);
});

// route - /api/v1/dashboard/line
app.get("/line", adminOnly, (req, res, next) => {
  getLineCharts(req, res, next).catch(next);
});

export default app;
