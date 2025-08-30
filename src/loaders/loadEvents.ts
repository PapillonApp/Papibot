import fs from "fs";
import path from "path";
import { Client } from "discord.js";

export default async function loadEvents(bot: Client) {
  const eventsPath = path.join(__dirname, "../events");

  fs.readdirSync(eventsPath)
    .filter((f) => f.endsWith(".js") || f.endsWith(".ts"))
    .forEach((file) => {
      const event = require(path.join(eventsPath, file));
      const eventHandler = event.default || event;

      const eventName = file.replace(/\.(js|ts)$/, "");
      bot.on(eventName, eventHandler.bind(null, bot));

      console.log(`✅ L'évènement ${eventName} a été chargé avec succès !`);
    });
}
