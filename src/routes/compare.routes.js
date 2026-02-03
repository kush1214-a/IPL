import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * GET /api/compare/teams?teamA=MI&teamB=PBKS
 */
router.get("/teams", async (req, res) => {
  try {
    const { teamA, teamB } = req.query;
    if (!teamA || !teamB) {
      return res.status(400).json({ error: "teamA and teamB required" });
    }

    const teams = await prisma.team.findMany({
      where: { short: { in: [teamA, teamB] } },
      include: {
        players: {
          include: { stats: true }
        }
      }
    });

    if (teams.length !== 2) {
      return res.status(404).json({ error: "Teams not found" });
    }

    const buildStats = (team) => {
      let matches = 0, runs = 0, wickets = 0;

      team.players.forEach(p => {
        p.stats.forEach(s => {
          matches += s.matches || 0;
          runs += s.runs || 0;
          wickets += s.wickets || 0;
        });
      });

      return {
        id: team.id,
        name: team.name,
        short: team.short,
        logo: team.logo,
        players: team.players.length,
        matches,
        runs,
        wickets
      };
    };

    const [A, B] = teams.map(buildStats);

    res.json({ teamA: A, teamB: B });

  } catch (err) {
    console.error("COMPARE ERROR:", err);
    res.status(500).json({ error: "Compare failed" });
  }
});

export default router;
