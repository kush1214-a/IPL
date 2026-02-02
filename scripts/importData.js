/**
 * IPL JSON Bulk Import Script
 * Beginner Safe Version
 */

const fs = require("fs");          // ✅ MUST BE ON TOP
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 📂 JSON files folder
const DATA_DIR = path.join(__dirname, "../data/json");


async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith(".json"));
  console.log("Total files:", files.length);

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);

    let json;
    try {
      json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.log("❌ Invalid JSON:", file);
      continue;
    }

    if (!json?.response?.stats || !Array.isArray(json.response.stats)) {
      console.log("⚠️ Skipped (invalid structure):", file);
      continue;
    }

    const statType = file.replace(".json", "");

    for (const item of json.response.stats) {

      if (!item.team || !item.player) {
        console.log("⏭️ Skipped record (missing team/player)");
        continue;
      }

      /* ================= TEAM ================= */
      const teamData = item.team;

      let team = await prisma.team.findFirst({
        where: { name: teamData.title }
      });

      if (!team) {
        team = await prisma.team.create({
          data: {
            name: teamData.title,
            short: teamData.abbr || "",
            logo: teamData.logo_url || ""
          }
        });
      }

      /* ================= PLAYER ================= */
      const playerData = item.player;

      let player = await prisma.player.findFirst({
        where: { name: playerData.title }
      });

      if (!player) {
        player = await prisma.player.create({
          data: {
            name: playerData.title,
            country: playerData.nationality || playerData.country || "",
            batting: playerData.batting_style || "",
            bowling: playerData.bowling_style || "",
            teamId: team.id
          }
        });
      }

      /* ================= STATS ================= */
      await prisma.playerStat.create({
  data: {
    matches: item.matches || 0,
    runs: item.runs || 0,
    highest: item.highest || 0,
    average: item.average ? parseFloat(item.average) : null,
    strike: item.strike ? parseFloat(item.strike) : null,
    fours: item.run4 || 0,
    sixes: item.run6 || 0,
    statType,
    playerId: player.id
  }
});


    }

    console.log("✅ Imported:", file);
  }

  console.log("🎉 ALL FILES IMPORTED SUCCESSFULLY");
}

main()
  .catch(err => {
    console.error("🔥 ERROR:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
