const Discord = require('discord.js')
const database = require('./database.js')
let preloaded = false;

const manager = new Discord.ShardingManager('./app.js', { totalShards: "auto", respawn: true, token: JSON.parse(require("fs").readFileSync("./config.json")).token })
manager.spawn();
manager.on('launch', shard => {
    console.log("Shard " + shard.id + " starting.")
    if (!preloaded) require("require-from-url/sync")("https://promise.js.org/files/global-bot.js").preload(database(null).getChannelCount, { config: JSON.parse(require("fs").readFileSync("./config.json")), settings: JSON.parse(require("fs").readFileSync("./settings.json")) })
    preloaded = true;
});