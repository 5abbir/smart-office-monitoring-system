import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { handleCommand } from './commands';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Bot is ready! Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!')) {
    await handleCommand(message);
  }
});

const token = process.env.DISCORD_TOKEN;
if (token) {
  client.login(token).catch(err => console.error('Failed to login:', err));
} else {
  console.warn('⚠️ No DISCORD_TOKEN found in .env');
}
