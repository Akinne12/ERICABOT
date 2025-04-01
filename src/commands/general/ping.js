// src/commands/general/ping.js
module.exports = {
    name: 'ping',
    description: 'Check bot latency.',
    async execute(message) {
      try {
        const sent = await message.channel.send('Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);
  
        await sent.edit(`🏓 Pong! Latency: ${latency}ms | API Latency: ${apiLatency}ms.`);
      } catch (error) {
        console.error('Error executing ping command:', error);
        message.reply('❗ Error checking latency.');
      }
    },
  };