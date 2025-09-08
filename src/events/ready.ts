import { ActivityType, Client } from "discord.js";
import loadSlashCommands from "../loaders/loadSlashCommands";
import loadDatabase from "../loaders/loadDatabase";
import express from "express";
import type { ExtendedClient } from "../types/ExtendedClient";
import type { Connection } from "mysql2";

export default async (bot: ExtendedClient) => {
  async function connectToDatabase(retries = 5): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        bot.db = loadDatabase();

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout de connexion à la BDD"));
          }, 10000);

          bot.db!.connect((err) => {
            clearTimeout(timeout);

            if (err) return reject(err);

            console.log("✅ Connecté à la base de données MySQL");

            bot.db!.removeAllListeners("error");
            bot.db!.removeAllListeners("end");
            bot.db!.removeAllListeners("close");

            bot.db!.on("error", async (error) => {
              console.error("⚠️ Erreur DB:", error);

              if (
                error.code === "ECONNRESET" ||
                error.code === "PROTOCOL_CONNECTION_LOST"
              ) {
                console.log("Tentative de reconnexion à la BDD...");
                try {
                  await connectToDatabase(3);
                } catch (reconnectError) {
                  console.error("Impossible de se reconnecter:", reconnectError);
                  process.exit(1);
                }
              } else {
                console.error("Erreur critique DB non gérée:", error);
              }
            });

            bot.db!.on("end", () => console.log("Connexion DB fermée"));
            bot.db!.on("close", () => console.log("Connexion DB interrompue"));

            resolve();
          });
        });

        return;
      } catch (error) {
        console.error(`Tentative ${i + 1}/${retries} échouée:`, error);

        if (i === retries - 1) {
          console.error(
            `❌ Impossible de se connecter après ${retries} tentatives`
          );
          throw error;
        }

        console.log("Nouvelle tentative dans 5 secondes...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Impossible de démarrer le bot:", error);
    process.exit(1);
  }

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

  // Lancer le serveur web
  //initWebServer(bot);


  
  // HEALTH SERVER FOR COOLIFY
  const app = express();
  const PORT = 8080;
  
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.listen(PORT, () => {
    console.log(`Health check server for Coolify listening on port ${PORT}`);
  });
};
