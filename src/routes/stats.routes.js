router.get("/batting_most_run100", async (req, res) => {
  const rows = await prisma.battingStat.groupBy({
    by: ["playerId"],
    _sum: { runs: true },
    orderBy: { _sum: { runs: "desc" } }
  });

  const result = await Promise.all(
    rows.map(async (r) => ({
      player: await prisma.player.findUnique({
        where: { id: r.playerId }
      }),
      value: r._sum.runs
    }))
  );

  res.json(result);
});
