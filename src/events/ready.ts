import { ActivityType } from "discord.js";
import loadSlashCommands from "../loaders/loadSlashCommands";
import loadDatabase from "../loaders/loadDatabase";
import express from "express";
import type { ExtendedClient } from "../types/ExtendedClient";

export default async (bot: ExtendedClient) => {
  const dbPool = loadDatabase();
  bot.db = dbPool;

  function pingDatabase() {
    dbPool.query("SELECT 1", (err) => {
      if (err) {
        console.error("❌ Test de connexion à la BDD échoué:", err);
      } else {
        console.log("✅ Pool MySQL opérationnel !");
      }
    });
  }

  pingDatabase();

  setInterval(pingDatabase, 2 * 60 * 60 * 1000);

  await loadSlashCommands(bot);

  bot.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "💜 Téléchargez Papillon V8 dès maintenant !",
        type: ActivityType.Custom,
      },
    ],
  });

  console.log(`🤖 ${bot.user?.tag} est connecté !`);

  // Serveur healthcheck
  const app = express();
  const PORT = 8080;

  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.listen(PORT, () => {
    console.log(`Health check server for Coolify listening on port ${PORT}`);
  });
};