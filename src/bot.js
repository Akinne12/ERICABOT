// bot.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');

// Load Config
const config = require('../.vscode/config.json');

// Import Utilities and Services
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');
const { rateLimiter } = require('./middlewares/rateLimiter');
const { authMiddleware } = require('./middlewares/authMiddleware');
const { connectToDatabase } = require('./database/connection');
const BotService = require('./services/botService');
const PremiumService = require('./services/premiumService');
const TrackingService = require('./services/trackingService');

// Create Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [
    Partials.User,
    Partials.GuildMember,
    Partials.Channel,
    Partials.Message
  ]
});

// Database Connection
connectToDatabase();
logger.info('✅ Database connection initialized');

// Middleware Setup
client.rateLimiter = rateLimiter;
client.authMiddleware = authMiddleware;
logger.info('✅ Middlewares loaded');

// Confirming Services and Utilities
logger.info('✅ Services loaded: BotService, PremiumService, TrackingService');
logger.info('✅ Utilities loaded: Logger, ErrorHandler, CacheManager');

// Initialize Collections
client.commands = new Collection();


// Load Commands
const loadCommands = () => {
  const commandFolders = fs.readdirSync('./src/commands');
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.name, command);
      logger.info(`✅ Loaded command: ${command.name}`);
    }
  }
};

// Load Events
const loadEvents = () => {
  const eventFolders = ['client', 'guild', 'message', 'interaction'];
  for (const folder of eventFolders) {
    const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./events/${folder}/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      logger.info(`📢 Loaded event: ${event.name}`);
    }
  }
};

// Track Messages
client.on('messageCreate', (message) => {
  if (!message.author.bot) {
    TrackingService.trackMessage(message.author.id);
  }
});

// Track Voice Time
client.voiceTimes = new Map();
client.on('voiceStateUpdate', (oldState, newState) => {
  if (!oldState.channelId && newState.channelId) {
    client.voiceTimes.set(newState.id, Date.now());
  } else if (oldState.channelId && !newState.channelId) {
    const joinTime = client.voiceTimes.get(oldState.id);
    if (joinTime) {
      const voiceMinutes = Math.floor((Date.now() - joinTime) / 60000);
      TrackingService.trackVoice(oldState.id, voiceMinutes);
      client.voiceTimes.delete(oldState.id);
    }
  }
});

// Track Invites
client.guildInvites = new Map();
client.on('guildMemberAdd', async (member) => {
  try {
    const guildInvites = await member.guild.invites.fetch();
    const cachedInvites = client.guildInvites.get(member.guild.id);
    const invite = guildInvites.find(inv => cachedInvites?.get(inv.code)?.uses < inv.uses);
    if (invite) {
      TrackingService.trackInvite(member.guild.id, invite.inviter.id);
      client.guildInvites.set(member.guild.id, guildInvites);
    }
  } catch (error) {
    logger.error(`❗ Error tracking invites: ${error}`);
  }
});

// Ready Event
client.once('ready', () => {
  logger.info(`🚀 Bot is online as ${client.user.tag}`);
  logger.info(`📌 Prefix: ${config.prefix}`);
  loadCommands();
  loadEvents();

  // Cache Invites
  client.guilds.cache.forEach(async (guild) => {
    const invites = await guild.invites.fetch().catch(() => null);
    if (invites) client.guildInvites.set(guild.id, invites);
  });
});

// Error Handling
process.on('uncaughtException', (error) => {
  logger.error(`🚨 Uncaught Exception: ${error.stack || error}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`🚨 Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Login to Discord
client.login(process.env.TOKEN)
  .then(() => logger.info('✅ Successfully Logged In'))
  .catch((err) => logger.error(`❌ Login Failed: ${err}`));
