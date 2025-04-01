// src/commands/general/ping.js
module.exports = {
  name: "ping",
  description: "Check bot latency",
  execute: async (message) => {
    try {
      const sent = await message.channel.send("Pinging...");
      const latency = sent.createdTimestamp - message.createdTimestamp;
      
      await sent.edit(`🏓 Pong!\n` +
        `• Bot Latency: ${latency}ms\n` +
        `• API Latency: ${Math.round(message.client.ws.ping)}ms`);
        
    } catch (error) {
      message.client.logger.error(`Ping command failed: ${error.stack}`);
      message.reply("❌ Failed to measure ping").catch(console.error);
    }
  }
};