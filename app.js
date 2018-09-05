const Discord = require('discord.js');
const fs = require('fs');
const DBL = require('dblapi.js');
const BLAPI = require("blapi")

const client = new Discord.Client({ disableEveryone: true })
const dbl = new DBL(require('./_TOKEN.js').DBL_TOKEN, client)

const settings = JSON.parse(fs.readFileSync('./settings.json'))
const modules = [ "talking", "reposting", "webhook" ]

client.on('ready', async () => {
    console.log("Ready!")

    client.user.setActivity("c!info (" + fs.readFileSync('./_counts.txt') + " global counts) [" + (client.shard.id == 0 ? "1" : client.shard.id) + "/" + client.shard.count + "]", { type: "WATCHING" })
    
    setInterval(() => {
        client.user.setActivity("c!info (" + fs.readFileSync('./_counts.txt') + " global counts) [" + (client.shard.id == 0 ? "1" : client.shard.id) + "/" + client.shard.count + "]", { type: "WATCHING" })
    }, 60000)

    let server_count = await client.shard.broadcastEval('this.guilds.size');
    server_count = server_count.reduce((a, b) => a + b, 0);

    // BLAPI.manualPost(server_count, client.user.id, require("./_TOKEN.js").BLAPI_TOKENS)
    BLAPI.handle(client, require("./_TOKEN.js").BLAPI_TOKENS, 1)
})

client.on('message', async message => {
    let content = message.content.toLowerCase();

    if (message.author.id == client.user.id) return;
    
    if (!message.guild && !(content.startsWith("c!help") || content.startsWith("c!info"))) message.channel.send(":x: This bot can only be used in guilds. If you want to read more, please go to our Discordbots.org-page: https://discordbots.org/bot/467377486141980682") // dms
    if (!message.guild) return; // if its in a DM, we don't want it to trigger any other command. If it's c!help or c!info, we don't want to send the info message above, but still not trigger any other command.

    if (message.channel.id == getCountingChannel(message.guild.id)) {
        if (message.author.bot && message.webhookID == null) return message.delete()
        if (message.webhookID != null) return;
        let count = getCount(message.guild.id)[0];
        let user = getCount(message.guild.id)[1];
        if (message.content.startsWith("!") && isAdmin(message.member)) return; // if it starts with ! and the user has MANAGE_GUILD then don't process it.
        if (message.type != "DEFAULT") return; // ex. pin messages gets ignored
        if (message.author.id == user) return message.delete() // we want someone else to count before the same person counts
        if (message.content.split(" ")[0] != (count + 1).toString()) return message.delete() // message.content.split(" ").splice(1)[0] = first word/number
        if (!moduleActivated(message.guild.id, "talking") && message.content != (count + 1).toString()) return message.delete() // if the module "talking" isn't activated and there's some text after it, we delete it as well
        addToCount(message.guild.id, message.author.id); count += 1;
        let countMsg = message;
        if (moduleActivated(message.guild.id, "reposting")) {
            if (!moduleActivated(message.guild.id, "webhook")) {
                countMsg = await message.channel.send({
                    embed: {
                        description: "<@!" + message.author.id + ">: " + message.content,
                        color: message.member.displayColor ? message.member.displayColor : 3553598
                    }
                })
                message.delete();
                checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)
            } else message.channel.fetchWebhooks().then(async webhooks => {
                let foundHook = webhooks.find('name', 'Countr Reposting');
                
                if (!foundHook) { // create a new webhook
                    message.channel.createWebhook('Countr Reposting', client.user.avatarURL)
                        .then(async webhook => {
                            webhook.edit('Countr Reposting', client.user.avatarURL)
                            countMsg = await webhook.send(message.content, {
                                username: message.author.username,
                                avatarURL: message.author.avatarURL
                            })

                            message.delete();
                            checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)
                        })
                } else countMsg = await foundHook.send(message.content, {
                    username: message.author.username,
                    avatarURL: message.author.avatarURL
                })
                
                message.delete();
                checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)

            }).catch();
        }
        
        return;
    }

    if (message.author.bot) return;

    if (content.startsWith("c!channel")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!");
        if (content.endsWith("none")) { saveCountingChannel(message.guild.id, "0"); message.channel.send(":white_check_mark: Unlinked counting channel."); }
        else { saveCountingChannel(message.guild.id, message.channel.id); message.channel.send(":white_check_mark: From now on, this channel will be used for counting."); }
    } else if (content.startsWith("c!reset")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
        setCount(message.guild.id, 0);
        
        return message.channel.send(":white_check_mark: Counting has been reset.");
    } else if (content.startsWith("c!toggle")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
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
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
        let topic = message.content.split(" ").splice(1);
        let override;

        if (topic[0] == "-a") { topic = topic.splice(1).join(" "); override = true } else topic = topic.join(" ");

        setTopic(message.guild.id, topic, override);
        if (topic.length == 0) return message.channel.send(":white_check_mark: The topic has been cleared.")
        return message.channel.send(":white_check_mark: The topic has been updated.")
    } else if (content.startsWith("c!set")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don\'t have permission!")
        let count = parseInt(message.content.split(" ").splice(1)[0]) || -1;
        if (count < 0) return message.channel.send(":x: Invalid count.");
        setCount(message.guild.id, count)
        return message.channel.send(":white_check_mark: Success! Count set to " + count + ".")
    }
})

function saveCountingChannel(guildid, channelid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    file[guildid].channel = channelid;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))

    updateTopic(guildid)
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

    updateTopic(guildid)
}

function getCount(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!parseInt(file[guildid].count)) file[guildid].count = 0;

    return [ file[guildid].count, file[guildid].user ];
}

function setCount(guildid, count) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    file[guildid].count = count;
    if (count == 0) file[guildid].user = "0";

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))

    updateTopic(guildid)
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

function checkSubscribed(guildid, count, countUser, messageID) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].subscriptions) file[guildid].subscriptions = {};

    for (let user in file[guildid].subscriptions) {
        file[guildid].subscriptions[user].forEach(number => {
            if (count == number) {
                file[guildid].subscriptions[user].splice(file[guildid].subscriptions[user].indexOf(number), 1); // remove the number from the subscriptions

                let guild = client.guilds.get(guildid)
                let member = guild.members.get(user)
                
                member.send("The guild " + guild.name + " just reached " + number + " total counts! :tada:\nThe user who sent it was <@" + countUser + ">\n[<https://discordapp.com/channels/" + guildid + "/" + getCountingChannel(guildid) + "/" + messageID + ">]")
            }
        })
    }

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))
}

function setTopic(guildid, topic, override = false) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}

    file[guildid].topic = topic;
    if (override == true) file[guildid].topicOverride = true; else file[guildid].topicOverride = undefined;

    fs.writeFileSync('./_guilds.json', JSON.stringify(file))

    updateTopic(guildid)
}

function getTopic(guildid) {
    let file = JSON.parse(fs.readFileSync('./_guilds.json'))
    if (!file[guildid]) file[guildid] = {}
    if (!file[guildid].topic) file[guildid].topic = "";

    return { "topic": file[guildid].topic, "topicOverride": file[guildid].topicOverride };
}

function updateTopic(guildid) {
    let topic = getTopic(guildid);
    if (!topic.topicOverride) try { client.guilds.get(guildid).channels.get(getCountingChannel(guildid)).setTopic((topic.topic == "" ? "" : topic.topic + " | ") + "**Next count: **" + (getCount(guildid)[0] + 1)); } catch(e) {}
    else if (topic.topic != "") try { client.guilds.get(guildid).channels.get(getCountingChannel(guildid)).setTopic(topic.topic.replace("{{COUNT}}", (getCount(guildid)[0] + 1))); } catch(e) {}
}

function isAdmin(member) {
    return member.hasPermission("MANAGE_GUILD") || member.user.id == "110090225929191424";
}

require('../debug.js').load(client, { dbl }); // debugging
require('../help.js').load(client, settings, dbl) // help command
// They are imported because they're used on all my bots.

client.login(require("./_TOKEN.js").TOKEN)
