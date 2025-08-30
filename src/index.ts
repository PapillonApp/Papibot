import { IntentsBitField } from "discord.js";
import "dotenv/config";

import { ExtendedClient } from "./types/ExtendedClient";
import loadCommands from "./loaders/loadCommands";
import loadEvents from "./loaders/loadEvents";

async function main() {
  const intents = new IntentsBitField(3276799);
  const bot = new ExtendedClient({ intents });

  try {
    await bot.login(process.env.TOKEN);
    console.log("✅ Bot connecté à l'API Discord");

    await loadCommands(bot);
    await loadEvents(bot);

    console.log("✅ Commandes et évènements chargés");
  } catch (error) {
    console.error("❌ Erreur au lancement du bot :", error);
    process.exit(1);
  }
}

main();
