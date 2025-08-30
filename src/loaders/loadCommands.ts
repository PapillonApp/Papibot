import fs from "fs";
import path from "path";
import { Client, Collection } from "discord.js";
import { Command } from "../types/Command";

export default async function loadCommands(bot: Client & { commands: Collection<string, Command> }) {
  const load = (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        load(filePath);
      } else if (file.endsWith(".js") || file.endsWith(".ts")) {
        try {
          const imported = require(filePath);
          const command: Command = imported.default || imported;

          if (!command?.name || typeof command.name !== "string") {
            throw new TypeError(
              `La commande ${file.replace(/\.(js|ts)$/, "")} n'a pas de nom !`
            );
          }

          bot.commands.set(command.name, command);
          console.log(`✅ Commande ${command.name} chargée avec succès !`);
        } catch (err: any) {
          console.error(
            `❌ Erreur lors du chargement de la commande ${file} : ${err.message}`
          );
        }
      }
    }
  };

  load(path.join(__dirname, "../commands"));
}
