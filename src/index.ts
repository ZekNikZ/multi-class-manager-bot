// Miscellaneous imports
import { Message } from 'discord.js';

// Configuration
require('dotenv').config();
import config from './util/config';

// Database
import admin from 'firebase-admin';
const serviceAccount = require('../firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Discord + Commando
import { CommandoClient } from 'discord.js-commando';
const client = new CommandoClient({
    commandPrefix: '!',
    commandEditableDuration: 0
});

// Command registry
import path from 'path';
client.registry
    .registerGroups([
        ['math', 'Math commands']
    ])
    .registerDefaults()
    // .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Settings Provider
const FirestoreProvider = require('./providers/firestore.js');
client.setProvider(
    new FirestoreProvider(db)
).catch(console.error);

// Handler
// import RootMessageHandler from './commands/index';
// import PingCommandHandler from './commands/ping';
// import configCommandHandler from './commands/config';
// const messageHandler = new RootMessageHandler();
// messageHandler.registerCommandHandler(new PingCommandHandler());
// messageHandler.registerCommandHandler(configCommandHandler);
// messageHandler.connect(client, db);

// Login handler
client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}`)
});

// // Message handler
// client.on('message', (msg: Message) => {
//     messageHandler.handleMessage(msg);
// });

// Login
client.login(process.env.DISCORD_BOT_TOKEN).then(res => {
    client.guilds.cache.forEach(async guild => {
        // Set up guild configs
        if (client.user !== null) {
            const guildConfigRef = db.collection('guild_configs').doc(guild.id);
            const guildConfig = await guildConfigRef.get();

            if (!guildConfig.exists) {
                let defaultConfig = {} as any;
                config.config.configKeys.forEach(({ key, ...obj }) => {
                    defaultConfig[key] = obj.defaultValue;
                });
                await guildConfigRef.set(defaultConfig);
            }

            guild.member(client.user)?.setNickname((guildConfig.data() || {})['nickname'] || config.getDefaultValue('nickname'))
        }
    });
});