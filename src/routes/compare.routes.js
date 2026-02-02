// src/routes/compare.routes.js

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * @swagger
 * /api/compare:
 *   get:
 *     summary: Compare two IPL teams
 *     tags:
 *       - Compare
 *     parameters:
 *       - in: query
 *         name: teamA
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: teamB
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team comparison result
 */
router.get("/", async (req, res) => {
  try {
    const { teamA, teamB } = req.query;

    if (!teamA || !teamB) {
      return res
        .status(400)
        .json({ message: "teamA and teamB query params required" });
    }

    const teams = await prisma.team.findMany({
      where: {
        short: {
          in: [teamA, teamB],
        },
      },
      include: {
        players: {
          include: {
            stats: true,
          },
        },
      },
    });

    if (teams.length !== 2) {
      return res.status(404).json({ message: "Teams not found" });
    }

    const result = teams.map((team) => {
      let totalRuns = 0;
      let totalMatches = 0;

      team.players.forEach((player) => {
        player.stats.forEach((stat) => {
          totalRuns += stat.runs || 0;
          totalMatches += stat.matches || 0;
        });
      });

      return {
        team: team.name,
        short: team.short,
        players: team.players.length,
        totalRuns,
        totalMatches,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("COMPARE ROUTE ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;