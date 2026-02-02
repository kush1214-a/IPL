import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/* ===============================
   CHART ROUTES (FIRST)
================================ */

router.get("/charts/top-runs", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: { stats: true },
    });

    const result = players
      .map(p => ({
        name: p.name,
        totalRuns: p.stats.reduce((sum, s) => sum + (s.runs || 0), 0),
      }))
      .sort((a, b) => b.totalRuns - a.totalRuns)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top runs" });
  }
});

router.get("/charts/team-runs", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: { include: { stats: true } },
      },
    });

    const result = teams.map(team => ({
      team: team.name,
      totalRuns: team.players.reduce(
        (teamSum, p) =>
          teamSum + p.stats.reduce((s, st) => s + (st.runs || 0), 0),
        0
      ),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team runs" });
  }
});

/* ===============================
   GENERIC STATS (LAST)
================================ */

const STAT_ORDER_MAP = {
  batting_most_runs: { runs: "desc" },
  batting_highest_average: { average: "desc" },
  batting_highest_strikerate: { strike: "desc" },
  batting_most_run100: { highest: "desc" },
  batting_most_run50: { highest: "desc" },

  bowling_best_economy_rates: { average: "asc" },
  bowling_best_strike_rates: { strike: "asc" },
};

router.get("/:statType", async (req, res) => {
  const { statType } = req.params;

  try {
    const orderBy = STAT_ORDER_MAP[statType];
    if (!orderBy) {
      return res.status(400).json({ error: "Invalid stat type" });
    }

    const data = await prisma.playerStat.findMany({
      where: { statType },
      include: {
        player: { include: { team: true } },
      },
      orderBy,
      take: 20,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
