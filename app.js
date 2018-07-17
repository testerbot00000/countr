const Discord = require('discord.js')
const manager = new Discord.ShardingManager('./bot.js', { totalShards: "auto", respawn: true })

manager.spawn();
manager.on('launch', shard => console.log(`Successfully launched shard ${shard.id}`));