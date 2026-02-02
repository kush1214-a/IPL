// src/routes/team.routes.js

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * GET /api/teams
 */
router.get("/", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

/**
 * GET /api/teams/:short
 * Example: /api/teams/CSK
 */
router.get("/:short", async (req, res) => {
  try {
    const { short } = req.params;

    const team = await prisma.team.findFirst({
      where: { short },
      include: {
        players: {
          include: {
            stats: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

export default router;
