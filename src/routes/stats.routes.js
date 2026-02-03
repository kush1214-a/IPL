import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/* ===============================
   CHART ROUTES
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

/* ===============================
   🔥 FINAL STATS ROUTE (NO DUPLICATE)
================================ */

router.get("/:statType", async (req, res) => {
  const { statType } = req.params;

  try {
    // 1️⃣ Fetch ALL rows for that statType
    const rows = await prisma.playerStat.findMany({
      where: { statType },
      include: {
        player: true,
      },
    });

    /*
      2️⃣ GROUP BY PLAYER
         - key   = playerId
         - value = BEST stat value
    */
    const bestByPlayer = {};

    for (const row of rows) {
      const playerId = row.playerId;

      const value =
        row.runs ??
        row.average ??
        row.strikeRate ??
        row.wickets ??
        0;

      if (!bestByPlayer[playerId]) {
        bestByPlayer[playerId] = {
          playerId,
          player: row.player,
          value,
        };
      } else {
        // keep ONLY the best value
        if (value > bestByPlayer[playerId].value) {
          bestByPlayer[playerId].value = value;
        }
      }
    }

    // 3️⃣ SORT + TAKE TOP 10
    const result = Object.values(bestByPlayer)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    res.json(result);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
