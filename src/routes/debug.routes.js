const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/rcb-test", async (req, res) => {
  try {
    console.log("➡️ API HIT: /rcb-test");

    const team = await prisma.team.findFirst({
      where: { short: "RCB" },
    });

    console.log("➡️ TEAM:", team);

    const players = await prisma.player.findMany({
      where: { teamId: team.id },
    });

    console.log("➡️ PLAYERS COUNT:", players.length);

    res.json({
      team,
      playersCount: players.length,
    });
  } catch (err) {
    console.error("❌ REAL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
