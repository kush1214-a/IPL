const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

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
        totalRuns += stat.runs;
        totalMatches += stat.matches;
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
});

module.exports = router;
