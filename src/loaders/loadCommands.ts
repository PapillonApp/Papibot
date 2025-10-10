import fs from "fs";
import path from "path";
import { Client, Collection } from "discord.js";
import { Command } from "../types/command";

export default async function loadCommands(bot: Client & { commands: Collection<string, Command> }) {
    const load = (dir: string) => {
        const files = fs.readdirSync(dir);
        
        for(const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if(stat.isDirectory()) {
                load(filePath);
            }
            else if(file.endsWith(".js") || file.endsWith(".ts"))
            {
                try {
                    const imported = require(filePath);
                    const command: Command = imported.default || imported;

                    if(!command.name || typeof command.name !== "string") {
                        throw new TypeError(`The ${file.replace(/\.(js|ts)$/, "")} command has no name`);
                    }
                    
                    bot.commands.set(command.name, command);
                    console.log(`The ${command.name} command has been loaded`);
                } catch (err: any) {
                    console.error(`Error while loading the ${file.replace(/\.(js|ts)$/, "")} command:`, err.message);
                }
            }
        }
    }
    
    load(path.join(__dirname, "../commands"));
}