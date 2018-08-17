const Discord = require('discord.js');
const fs = require('fs');
const DBL = require('dblapi.js');
const Listcord = require('listcord');

const client = new Discord.Client({ disableEveryone: true })
const dbl = new DBL(require('./_TOKEN.js').DBL_TOKEN, client)
const listcord = new Listcord.Client(require('./_TOKEN.js').LISTCORD_TOKEN)

const settings = JSON.parse(fs.readFileSync('./settings.json'))
const modules = [ "talking", "reposting", "webhook" ]

client.on('ready', () => {
    console.log("Ready!")

    client.user.setActivity("c!info (" + fs.readFileSync('./_counts.txt') + " global counts) [" + (client.shard.id == 0 ? "1" : client.shard.id) + "/" + client.shard.count + "]", { type: "WATCHING" })
    
    setInterval(() => {
        client.user.setActivity("c!info (" + fs.readFileSync('./_counts.txt') + " global counts) [" + (client.shard.id == 0 ? "1" : client.shard.id) + "/" + client.shard.count + "]", { type: "WATCHING" })
    }, 60000)

    postStats(client)
    setInterval(() => { postStats(client) }, 900000)
})

async function postStats(client) {
    dbl.postStats(client.guilds.size, client.shard.id, client.shard.count).then().catch(console.log);
    const counts = await client.shard.broadcastEval('this.guilds.size')
    listcord.postStats(client.user.id, counts.reduce((prev, val) => prev + val, 0), client.shard.count).then().catch(console.log);
}

client.on('message', message => {
    let content = message.content.toLowerCase();

    if (message.author.id == client.user.id) return;
    
    if (!message.guild) return message.channel.send(":x: This bot can only be used in guilds. If you want to read more, please go to our Discordbots.org-page: https://discordbots.org/bot/467377486141980682") // dms

    if (message.channel.id == getCountingChannel(message.guild.id)) {
        if (message.author.bot && message.webhookID == null) return message.delete()
        if (message.webhookID != null) return;
        let count = getCount(message.guild.id)[0];
        let user = getCount(message.guild.id)[1];
        if (message.content.startsWith("!") && message.member.hasPermission("MANAGE_GUILD")) return; // if it starts with ! and the user has MANAGE_GUILD then don't process it.
        if (message.type != "DEFAULT") return; // ex. pin messages gets ignored
        if (message.author.id == user) return message.delete() // we want someone else to count before the same person counts
        if (message.content.split(" ")[0] != (count + 1).toString()) return message.delete() // message.content.split(" ").splice(1)[0] = first word/number
        if (!moduleActivated(message.guild.id, "talking") && message.content != (count + 1).toString()) return message.delete() // if the module "talking" isn't activated and there's some text after it, we delete it as well
        addToCount(message.guild.id, message.author.id); count += 1;
        checkSubscribed(message.guild.id, count, user);
        message.channel.setTopic((getTopic(message.guild.id) == "" ? "" : getTopic(message.guild.id) + " | ") + "**Next count: **" + (count + 1));
        if (moduleActivated(message.guild.id, "reposting")) {
            if (!moduleActivated(message.guild.id, "webhook")) {
                message.channel.send({
                    embed: {
                        description: "<@!" + message.author.id + ">: " + message.content,
                        color: message.member.displayColor ? message.member.displayColor : 3553598
                    }
                })
                message.delete();
            } else message.channel.fetchWebhooks().then(async webhooks => {
                let foundHook = webhooks.find('name', 'Countr Reposting');
                
                if (!foundHook) { // create a new webhook
                    message.channel.createWebhook('Countr Reposting', client.user.avatarURL)
                        .then(async webhook => {
                            webhook.edit('Countr Reposting', client.user.avatarURL)
                            await webhook.send(message.content, {
                                username: message.author.username,
                                avatarURL: message.author.avatarURL
                            }).then(() => { message.delete(); }) // if it didn't work, we don't want to delete the message
                        })
                } else await foundHook.send(message.content, {
                    username: message.author.username,
                    avatarURL: message.author.avatarURL
                }).then(() => { message.delete(); }) // if it didn't work, we don't want to delete the message
            }).catch();
        }
        return;
    }

    if (message.author.bot) return;

    if (content.startsWith("c!channel")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!");
        if (content.endsWith("none")) { saveCountingChannel(message.guild.id, "0"); message.channel.send(":white_check_mark: Unlinked counting channel."); }
        else { saveCountingChannel(message.guild.id, message.channel.id); message.channel.send(":white_check_mark: From now on, this channel will be used for counting."); }
    } else if (content.startsWith("c!reset")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        resetCount(message.guild.id);

        let channel = message.guild.channels.get(getCountingChannel(message.guild.id));
        if (channel) channel.setTopic("**Next count: **1");
        return message.channel.send(":white_check_mark: Counting has been reset.");
    } else if (content.startsWith("c!toggle")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        let arg = message.content.split(" ").splice(1)[0] // gets the first arg and makes it lower case
        if (!arg) {
            return message.channel.send(":clipboard: Modules: \`" + modules.join("\`, \`") + "\` - To read more about them, go to the Discordbots.org-page. Link located under the command `c!info`")
        }
        arg = arg.toLowerCase()
        if (modules.includes(arg)) {
            editModule(message.guild.id, arg, (moduleActivated(message.guild.id, arg) ? false : true))
            return message.channel.send(":white_check_mark: Module \`" + arg + "\` now " + (moduleActivated(message.guild.id, arg) ? "enabled" : "disabled") + ".")
        } else {
            return message.channel.send(":x: Module does not exist.")
        }
    } else if (content.startsWith("c!subscribe")) {
        let number = parseInt(message.content.split(" ").splice(1)[0])
        if (!number) return message.channel.send(":x: Invalid count.")

        if (!getCount(message.guild.id)[0]) return message.channel.send(":x: There is no counting channel set up in this guild.")
        if (number <= getCount(message.guild.id)[0]) return message.channel.send(":warning: You can't subscribe to a count that's under the current count.")

        subscribe(message.guild.id, message.author.id, number)
        return message.channel.send(":white_check_mark: I will notify you when this server reach " + number + " total counts.")
    } else if (content.startsWith("c!topic")) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(":x: You don't have permission!")
        let topic = message.content.split(" ").splice(1).join(" ");
        setTopic(message.guild.id, topic);
        if (topic.length == 0) return message.channel.send(":white_check_mark: The topic has been cleared.")
        return message.channel.send(":white_check_mark: The topic has been updated.")
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

function editModule(guildid, moduleStr, value) { // module is already something in js
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].modules) file[guildid].modules = {};

    file[guildid].modules[moduleStr] = value == true ? true : undefined;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function moduleActivated(guildid, moduleStr) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].modules) file[guildid].modules = {};

    return file[guildid].modules[moduleStr]
}

function subscribe(guildid, userid, number) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].subscriptions) file[guildid].subscriptions = {};
    if (!file[guildid].subscriptions[userid]) file[guildid].subscriptions[userid] = [];

    file[guildid].subscriptions[userid].push(number)

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function checkSubscribed(guildid, count, countUser) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].subscriptions) file[guildid].subscriptions = {};

    for (let user in file[guildid].subscriptions) {
        file[guildid].subscriptions[user].forEach(number => {
            if (count == number) {
                file[guildid].subscriptions[user].splice(file[guildid].subscriptions[user].indexOf(number), 1); // remove the number from the subscriptions

                let guild = client.guilds.get(guildid)
                let member = guild.members.get(user)
                
                member.send("The guild " + guild.name + " just reached " + number + " total counts! :tada:\nThe user who sent it was <@" + countUser + ">")
            }
        })
    }

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function setTopic(guildid, topic) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}

    file[guildid].topic = topic;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function getTopic(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].topic) file[guildid].topic = "";

    return file[guildid].topic;
}

require('../debug.js').load(client, { dbl, listcord }); // debugging
require('../help.js').load(client, settings, dbl, listcord) // help command
// They are imported because they're used on all my bots.

client.login(require("./_TOKEN.js").TOKEN)
