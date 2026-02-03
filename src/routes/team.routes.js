import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET all teams
 */
router.get("/", async (req, res) => {
  const teams = await prisma.team.findMany();
  res.json(teams);
});

/**
 * GET team by short code (RCB, KKR, CSK)
 */
router.get("/:short", async (req, res) => {
  const { short } = req.params;

  const team = await prisma.team.findFirst({
    where: { short },
    include: {
      players: true,
    },
  });

  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  res.json(team);
});

export default router;