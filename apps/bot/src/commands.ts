import { Message, TextChannel, DMChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { fetchStatus, fetchRoom, fetchUsage } from './api';
import { formatWithGroq } from './groq';

type TypableChannel = TextChannel | DMChannel | NewsChannel | ThreadChannel;

function canSendTyping(channel: unknown): channel is TypableChannel {
  return typeof channel === 'object' && channel !== null && 'sendTyping' in channel;
}

export async function handleCommand(message: Message) {
  const [command, ...args] = message.content.toLowerCase().split(' ');

  try {
    if (command === '!status') {
      if (canSendTyping(message.channel)) message.channel.sendTyping();
      const data = await fetchStatus();
      const reply = await formatWithGroq('status', data);
      message.reply(reply);
    } else if (command === '!room') {
      if (args.length === 0) {
        message.reply('Please specify a room, e.g., !room drawing_room');
        return;
      }
      if (canSendTyping(message.channel)) message.channel.sendTyping();
      const room = args[0];
      const data = await fetchRoom(room);
      if ('error' in data) {
        message.reply(`Error: ${data.error}`);
        return;
      }
      const reply = await formatWithGroq('room', { room, devices: data });
      message.reply(reply);
    } else if (command === '!usage') {
      if (canSendTyping(message.channel)) message.channel.sendTyping();
      const data = await fetchUsage();
      const reply = await formatWithGroq('usage', data);
      message.reply(reply);
    }
  } catch (error: any) {
    console.error('Command error:', error);
    message.reply('Sorry, I encountered an error processing that command.');
  }
}
