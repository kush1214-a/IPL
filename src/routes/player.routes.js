import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          team: true,
          stats: true
        }
      }),
      prisma.player.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: players,
      page,
      totalPages,
      total
    });
  } catch (e) {
    console.error("Players fetch error:", e);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

export default router;
