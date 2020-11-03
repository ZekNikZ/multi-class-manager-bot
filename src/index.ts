import { CommandoClient } from 'discord.js-commando';
import path from 'path';

import config from './util/config';
import db from './util/db';

// .env preloader
require('dotenv').config();

// Discord + Commando
const client = new CommandoClient({
    commandPrefix: '!',
    owner: '133105799818903552',
    commandEditableDuration: 0
});

// Command registry
client.registry
    .registerGroups([
        ['math', 'Math commands'],
        ['config', 'Configuration commands']
    ])
    .registerDefaults()
    // .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Settings Provider
const FirestoreProvider = require('./providers/firestore.js');
client.setProvider(
    new FirestoreProvider(db)
).catch(console.error);

// Login handler
client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}`)
});

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