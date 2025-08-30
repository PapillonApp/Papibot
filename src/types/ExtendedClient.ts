import { Client, Collection, ClientOptions } from "discord.js";
import type { Command } from "./Command";
import type { Connection } from "mysql2";

export class ExtendedClient extends Client {
  public commands: Collection<string, Command>;
  public db?: Connection;

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
