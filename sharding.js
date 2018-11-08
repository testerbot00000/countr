const Discord = require('discord.js')

const manager = new Discord.ShardingManager('./app.js', { totalShards: "auto", respawn: true, token: JSON.parse(require("fs").readFileSync("./config.json")).token })

manager.spawn();
manager.on('launch', shard => console.log("Shard " + shard.id + " starting."));