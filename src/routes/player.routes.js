// src/routes/player.routes.js

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * GET /api/players?page=1
 */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const players = await prisma.player.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        team: true,
        stats: true,
      },
    });

    res.json({
      page,
      count: players.length,
      players,
    });
  } catch (err) {
    console.error("PLAYER ROUTE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

export default router;
