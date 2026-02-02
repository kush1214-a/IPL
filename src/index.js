// src/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import teamRoutes from "./routes/team.routes.js";
import playerRoutes from "./routes/player.routes.js";
import compareRoutes from "./routes/compare.routes.js";
import statsRoutes from "./routes/stats.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IPL Backend API is running 🚀");
});

app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
