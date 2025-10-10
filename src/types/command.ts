import type { ChatInputCommandInteraction } from "discord.js";
import type { ExtendedClient } from "./extendedClient";

export interface CommandOption {
  type: string;
  name: string;
  description: string;
  required?: boolean;
  minValue?: number;
  maxValue?: number;
}

export interface Command {
  name: string;
  description?: string;
  dm?: boolean;
  permission?: string;
  options?: CommandOption[];

  run?: (bot: ExtendedClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
