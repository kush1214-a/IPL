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

    // fetch teams
    const [A, B] = await Promise.all([
      prisma.team.findFirst({ where: { short: teamA } }),
      prisma.team.findFirst({ where: { short: teamB } })
    ]);

    if (!A || !B) {
      return res.status(404).json({ error: "Team not found" });
    }

    // aggregate stats from matches table (example logic)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { teamAId: A.id, teamBId: B.id },
          { teamAId: B.id, teamBId: A.id }
        ]
      }
    });

    let stats = {
      playedA: matches.length,
      playedB: matches.length,
      winsA: 0,
      winsB: 0,
      lostA: 0,
      lostB: 0,
      noResultA: 0,
      noResultB: 0
    };

    matches.forEach(m => {
      if (m.winnerId === A.id) {
        stats.winsA++; stats.lostB++;
      } else if (m.winnerId === B.id) {
        stats.winsB++; stats.lostA++;
      } else {
        stats.noResultA++; stats.noResultB++;
      }
    });

    res.json(stats);

  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ error: "Compare failed" });
  }
});

export default router;
