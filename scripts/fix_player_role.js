import prisma from "../src/prisma.js";

const ROLE_MAP = {
  bat: "BATTER",
  bowl: "BOWLER",
  all: "ALL-ROUNDER",
  wk: "WICKET-KEEPER",
};

async function run() {
  const players = await prisma.player.findMany();

  let updated = 0;
  let skipped = 0;

  for (const p of players) {
    if (p.role) {
      skipped++;
      continue;
    }

    let role = null;

    if (p.batting && p.bowling) role = "ALL-ROUNDER";
    else if (p.batting) role = "BATTER";
    else if (p.bowling) role = "BOWLER";

    if (!role) {
      skipped++;
      continue;
    }

    await prisma.player.update({
      where: { id: p.id },
      data: { role },
    });

    updated++;
  }

  console.log("🎉 ROLE FIX DONE");
  console.log("Updated:", updated);
  console.log("Skipped:", skipped);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
