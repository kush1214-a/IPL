import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * statType -> orderBy field mapping
 */
const STAT_ORDER_MAP = {
  bowling_top_wicket_takers: { runs: "desc" },      // wickets stored in runs
  batting_most_runs: { runs: "desc" },
  batting_most_run100: { highest: "desc" },
  batting_most_run50: { highest: "desc" },
  batting_highest_average: { average: "desc" },
  batting_highest_strikerate: { strike: "desc" },
  bowling_best_economy_rates: { average: "asc" },
  bowling_best_strike_rates: { strike: "asc" },
};

router.get("/:statType", async (req, res) => {
  const { statType } = req.params;
  console.log("➡️ Stats API HIT:", statType);

  try {
    const orderBy = STAT_ORDER_MAP[statType];

    if (!orderBy) {
      return res.status(400).json({ error: "Invalid stat type" });
    }

    const data = await prisma.playerStat.findMany({
      where: { statType },
      include: { player: true },
      orderBy,
      take: 20,
    });

    res.json(data);
  } catch (error) {
    console.error("❌ STATS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
