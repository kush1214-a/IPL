import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;

    const total = await prisma.player.count();
    const totalPages = Math.ceil(total / limit);

    // ✅ IMPORTANT FIX: invalid page guard
    if (page > totalPages) {
      return res.json({
        data: [],
        page,
        totalPages,
        total
      });
    }

    const skip = (page - 1) * limit;

    const players = await prisma.player.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        team: true,
        stats: true
      }
    });

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
