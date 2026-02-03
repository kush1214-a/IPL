import fs from "fs";
import path from "path";
import prisma from "../src/prisma.js";

const DATA_DIR = "./data/json";

function num(v) {
  if (v === undefined || v === null || v === "") return 0;
  return Number(v) || 0;
}

async function run() {
  const files = fs.readdirSync(DATA_DIR);

  let importedPlayers = 0;
  let importedStats = 0;
  let ignored = 0;

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const json = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, file), "utf8")
    );

    // ❌ ignore team / aggregate files
    if (!json.player || !json.player.title) {
      ignored++;
      continue;
    }

    const name = json.player.title;
    const country = json.player.country || null;
    const role = json.player.playing_role || null;

    // ✅ SAFE UPSERT
    const player = await prisma.player.upsert({
      where: { name },
      update: { country, role },
      create: {
        name,
        country,
        role,
        teamId: 1   // default team (can fix later)
      }
    });

    importedPlayers++;

    // ✅ Batting stats
    if (json.batting) {
      for (const [format, stat] of Object.entries(json.batting)) {
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
        importedStats++;
      }
    }

    // ✅ Bowling stats
    if (json.bowling) {
      for (const [format, stat] of Object.entries(json.bowling)) {
        await prisma.playerStat.create({
          data: {
            statType: `bowling_${format}`,
            matches: num(stat.matches),
            wickets: num(stat.wickets),
            runs: num(stat.runs),
            average: stat.average ? Number(stat.average) : null,
            strike: stat.strike ? Number(stat.strike) : null,
            playerId: player.id
          }
        });
        importedStats++;
      }
    }
  }

  console.log("🎉 DONE");
  console.log("Players imported:", importedPlayers);
  console.log("Stats imported:", importedStats);
  console.log("Ignored non-player files:", ignored);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
