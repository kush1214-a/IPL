import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * GET /api/compare?teamA=CSK&teamB=MI
 */
router.get("/", async (req, res) => {
  try {
    const { teamA, teamB } = req.query;

    if (!teamA || !teamB) {
      return res.status(400).json({
        message: "teamA and teamB are required",
      });
    }

    const teams = await prisma.team.findMany({
      where: {
        short: { in: [teamA, teamB] },
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
      return res.status(404).json({
        message: "Teams not found",
      });
    }

    const result = teams.map((team) => {
      let totalRuns = 0;
      let totalMatches = 0;
      let totalWickets = 0;

      team.players.forEach((player) => {
        player.stats.forEach((stat) => {
          totalRuns += stat.runs || 0;
          totalMatches += stat.matches || 0;
          totalWickets += stat.wickets || 0;
        });
      });

      return {
        name: team.name,
        short: team.short,
        players: team.players.length,
        totalRuns,
        totalMatches,
        totalWickets,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("COMPARE ERROR:", err);
    res.status(500).json({ error: "Compare failed" });
  }
});

export default router;
