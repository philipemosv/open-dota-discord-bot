import {
  Client,
  GatewayIntentBits,
  Collection,
  MessageFlags,
} from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import './db';

type BotCommand = {
  data: { name: string };
  execute: (interaction: any) => Promise<unknown>;
};

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('DISCORD_TOKEN is not set in environment.');
    process.exit(1);
  }

  console.log('SQLite database initialized.');

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const commands = new Collection<string, BotCommand>();
  (client as any).commands = commands;

  const commandsPath = path.join(__dirname, 'commands');
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const commandModule = require(filePath);
        const command: BotCommand = commandModule?.default ?? commandModule;

        if (!command || typeof command.data?.name !== 'string') {
          console.warn(`Skipping invalid command file: ${file}`);
          continue;
        }

        commands.set(command.data.name, command);
      } catch (err) {
        console.error(`Failed to load command ${file}:`, err);
      }
    }
  } else {
    console.warn(`Commands directory not found: ${commandsPath}`);
  }

  client.once('clientReady', () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand?.()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error,
      );
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: 'There was an error while executing this command!',
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch {
        // Interaction expired or already handled, ignore
      }
    }
  });

  try {
    await client.login(token);
  } catch (loginError) {
    console.error('Failed to login:', loginError);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error starting bot:', err);
  process.exit(1);
});
