import { Client, Collection, ClientOptions } from "discord.js";
import type { Command } from "./Command";
import type { Pool } from "mysql2";

export class ExtendedClient extends Client {
  public commands: Collection<string, Command>;
  public db?: Pool;

  public errors: Map<
    string,
    { description: string; errorText: string; errorCode: string | number }
  >;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.errors = new Map();
  }
}