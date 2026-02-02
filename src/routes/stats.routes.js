import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * ===============================
 * 1️⃣ STAT TYPE → ORDER MAPPING
 * ===============================
 */
const STAT_ORDER_MAP = {
  bowling_top_wicket_takers: { wickets: "desc" },
  bowling_four_wickets: { wickets: "desc" },
  bowling_five_wickets: { wickets: "desc" },

  batting_most_runs: { runs: "desc" },
  batting_most_run100: { highest: "desc" },
  batting_most_run50: { highest: "desc" },
  batting_highest_average: { average: "desc" },
  batting_highest_strikerate: { strike: "desc" },

  bowling_best_economy_rates: { economy: "asc" },
  bowling_best_strike_rates: { strike: "asc" },
};

/**
 * ===============================
 * 2️⃣ GENERIC STATS API
 * ===============================
 * GET /api/stats/:statType
 */
router.get("/:statType", async (req, res) => {
  const { statType } = req.params;

  try {
    const orderBy = STAT_ORDER_MAP[statType];

    if (!orderBy) {
      return res.status(400).json({
        error: "Invalid stat type",
      });
    }

    const data = await prisma.playerStat.findMany({
      where: { statType },
      include: {
        player: {
          include: { team: true },
        },
      },
      orderBy,
      take: 20,
    });

    res.json(data);
  } catch (error) {
    console.error("❌ STATS ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch stats",
    });
  }
});

/**
 * ===============================
 * 3️⃣ TOP RUN SCORERS (BAR CHART)
 * ===============================
 * GET /api/stats/top-runs
 */
router.get("/charts/top-runs", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: { stats: true },
    });

    const result = players
      .map((p) => ({
        name: p.name,
        totalRuns: p.stats.reduce((sum, s) => sum + (s.runs || 0), 0),
      }))
      .sort((a, b) => b.totalRuns - a.totalRuns)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    console.error("❌ TOP RUNS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch top runs" });
  }
});

/**
 * ===============================
 * 4️⃣ TEAM-WISE TOTAL RUNS (PIE)
 * ===============================
 * GET /api/stats/team-runs
 */
router.get("/charts/team-runs", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          include: { stats: true },
        },
      },
    });

    const result = teams.map((team) => ({
      team: team.name,
      totalRuns: team.players.reduce(
        (teamSum, player) =>
          teamSum +
          player.stats.reduce((s, stat) => s + (stat.runs || 0), 0),
        0
      ),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ TEAM RUNS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch team runs" });
  }
});

export default router;