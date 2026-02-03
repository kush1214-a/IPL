import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const players = await prisma.player.findMany({
      skip,
      take: limit,
      include: {
        team: true,
        stats: true
      },
      orderBy: { name: "asc" }
    });

    res.json(players);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

export default router;