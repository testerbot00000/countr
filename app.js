const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client({ disableEveryone: true })

client.on('ready', () => {
    console.log("Ready!")

    client.user.setActivity("people count (" + fs.readFileSync('./_counts.txt') + " global counts)", { type: "WATCHING" })
    
    setInterval(() => {
        client.user.setActivity("people count (" + fs.readFileSync('./_counts.txt') + " global counts)", { type: "WATCHING" })
    }, 60000)
})

client.on('message', message => {
    let content = message.content.toLowerCase();

    if (message.author.id == client.user.id) return;

    if (message.channel.id == getCountingChannel(message.guild.id)) {
        let count = getCount(message.guild.id)[0];
        let user = getCount(message.guild.id)[1];
        if (message.author.id == user) return message.delete() // we want someone else to count before the same person counts
        if (message.content != (count + 1).toString()) return message.delete()
        addToCount(message.guild.id, message.author.id); count += 1;
        message.channel.setTopic("**Next count: **" + (count + 1));
    }

    if (content.startsWith("c!channel")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        saveCountingChannel(message.guild.id, message.channel.id)
        return message.channel.send(":white_check_mark: From now on, this channel will be used for counting.");
    } else if (content.startsWith("c!reset")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        resetCount(message.guild.id);

        let channel = message.guild.channels.get(getCountingChannel(message.guild.id));
        if (channel) channel.setTopic("**Next count: **1");
        return message.channel.send(":white_check_mark: Counting has been reset.");
    } else if (content.startsWith("c!troubleshoot")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        let channel = message.guild.channels.get(getCountingChannel(message.guild.id))
        if (!channel) return message.channel.send("The channel does not exist. To set a channel, type `c!channel` in the specified channel.")
        let bitfield = message.channel.permissionsFor(client.user)
        if (bitfield & 0x400 == 0) return message.channel.send("The bot cannot see the channel.")
        if (bitfield & 0x10 == 0) return message.channel.send("The bot cannot edit the channel. (topic)")
        if (bitfield & 0x2000 == 0) return message.channel.send("The bot cannot delete unimportant messages from the channel.")
        message.channel.send("Troubleshooting didn't get far. Either it's working or something else is wrong. Ask for support in the support channel.")
    }

})

function saveCountingChannel(guildid, channelid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    file[guildid].channel = channelid;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function getCountingChannel(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}

    return file[guildid].channel;
}

function addToCount(guildid, userid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!parseInt(file[guildid].count)) file[guildid].count = 0;
    file[guildid].count += 1;
    file[guildid].user = userid;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
    
    fs.writeFileSync('./_counts.txt', parseInt(fs.readFileSync('./_counts.txt')) + 1)
}

function getCount(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!parseInt(file[guildid].count)) file[guildid].count = 0;

    return [ file[guildid].count, file[guildid].user ];
}

function resetCount(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    file[guildid].count = 0;
    file[guildid].user = "0";

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

client.login(require("./_TOKEN.js").TOKEN)