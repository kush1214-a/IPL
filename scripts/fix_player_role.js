// backend/scripts/fix_player_role.js
// FINAL & PRODUCTION SAFE ROLE FIX SCRIPT

import prisma from "../src/prisma.js";

async function fixPlayerRoles() {
  console.log("🔧 Fixing player roles using STATS (not batting/bowling style)...");

  const players = await prisma.player.findMany({
    include: { stats: true }
  });

  let updated = 0;

  for (const player of players) {
    let hasBatting = false;
    let hasBowling = false;

    for (const stat of player.stats) {
      if (stat.statType && stat.statType.startsWith("batting")) {
        hasBatting = true;
      }
      if (stat.statType && stat.statType.startsWith("bowling")) {
        hasBowling = true;
      }
    }

    let role = "PLAYER";

    if (hasBatting && hasBowling) role = "ALL-ROUNDER";
    else if (hasBatting) role = "BATTER";
    else if (hasBowling) role = "BOWLER";

    // UPDATE ONLY IF DIFFERENT
    if (player.role !== role) {
      await prisma.player.update({
        where: { id: player.id },
        data: { role }
      });
      updated++;
    }
  }

  console.log("✅ Player roles fixed successfully");
  console.log("🔁 Players updated:", updated);
}

fixPlayerRoles()
  .catch((err) => {
    console.error("❌ Error fixing player roles:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

