import fs from "fs";
import path from "path";
import prisma from "../src/prisma.js";

const DATA_DIR = "./data/json";

function num(v, def = 0) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function detectRole(json) {
  const hasBat = json.batting && Object.keys(json.batting).length > 0;
  const hasBowl = json.bowling && Object.keys(json.bowling).length > 0;

  if (hasBat && hasBowl) return "ALL-ROUNDER";
  if (hasBat) return "BATTER";
  if (hasBowl) return "BOWLER";
  return "UNKNOWN";
}

async function run() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));

  let imported = 0;
  let ignored = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // ✅ HARD FILTER (MOST IMPORTANT LINE)
    if (!json.player || !json.player.title) {
      ignored++;
      continue; // team_total_*.json silently skipped
    }

    try {
      const name = json.player.title;
      const role = detectRole(json);

      let player = await prisma.player.findFirst({ where: { name } });

      if (!player) {
        player = await prisma.player.create({
          data: {
            name,
            country: json.player.country || null,
            role,
            teamId: 1
          }
        });
      } else {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            country: json.player.country || player.country,
            role
          }
        });
      }

      // Batting
      for (const [format, stat] of Object.entries(json.batting || {})) {
        await prisma.playerStat.create({
          data: {
            statType: `batting_${format}`,
            matches: num(stat.matches),
            runs: num(stat.runs),
            highest: num(stat.highest),
            average: stat.average ? Number(stat.average) : null,
            strike: stat.strike ? Number(stat.strike) : null,
            fours: num(stat.run4),
            sixes: num(stat.run6),
            playerId: player.id
          }
        });
      }

      // Bowling
      for (const [format, stat] of Object.entries(json.bowling || {})) {
        await prisma.playerStat.create({
          data: {
            statType: `bowling_${format}`,
            matches: num(stat.matches),
            runs: num(stat.runs),
            highest: 0,
            average: stat.average ? Number(stat.average) : null,
            strike: stat.strike ? Number(stat.strike) : null,
            fours: 0,
            sixes: 0,
            playerId: player.id
          }
        });
      }

      imported++;
    } catch (e) {
      console.error("❌ ERROR:", file, e.message);
    }
  }

  console.log("🎉 DONE");
  console.log("Imported players:", imported);
  console.log("Ignored non-player files:", ignored);
}

run();
