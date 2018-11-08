const Discord = require('discord.js');
const fs = require('fs');
const DBL = require('dblapi.js');
const BLAPI = require("blapi");

const settings = JSON.parse(fs.readFileSync('./settings.json'))
const config = JSON.parse(fs.readFileSync('./config.json'))
const globalCode = require("require-from-url/sync")("https://gleeny.github.io/files/global-bot.js"); // includes commands that are not part of the bot concept, ex. ping, help, eval. Also includes advanced logging.

const client = new Discord.Client({ disableEveryone: true })
const dbl = new DBL(config.blapiKeys["discordbots.org"], client)

const database = require("./database.js")(client)

const allModules = [ "allow-spam", "talking", "reposting", "webhook" ]

client.on('ready', async () => {

    updateActivity()
    setInterval(() => {
        updateActivity()
    }, 60000)

    BLAPI.handle(client, config.blapiKeys, 1)
})

async function updateActivity() {
    let count = await database.getChannelCount();
    client.user.setActivity("c!info (" + count + " counting channels) [" + (client.shard.id == 0 ? "1" : client.shard.id) + "/" + client.shard.count + "]", { type: "WATCHING" })
}

client.on('message', async message => {
    let content = message.content.toLowerCase();

    if (message.author.id == client.user.id) return;
    
    if (!message.guild) return; // if its in a DM, we don't want it to trigger any other command. If it's c!help or c!info, we don't want to send the info message above, but still not trigger any other command.

    let countingChannel = await database.getCountingChannel(message.guild.id);
    if (message.channel.id == countingChannel) {
        if (message.author.bot && message.webhookID == null) return message.delete()
        if (message.webhookID != null) return;
        let _count = await database.getCount(message.guild.id);
        let count = _count.count;
        let user = _count.user;
        if (message.content.startsWith("!") && isAdmin(message.member)) return; // if it starts with ! and the user has MANAGE_GUILD then don't process it.
        if (message.type != "DEFAULT") return; // ex. pin messages gets ignored
        let modules = await database.getModules(message.guild.id);
        if (!modules.includes("allow-spam") && message.author.id == user) return message.delete() // we want someone else to count before the same person counts
        if (message.content.split(" ")[0] != (count + 1).toString()) return message.delete() // message.content.split(" ").splice(1)[0] = first word/number
        if (!modules.includes("talking") && message.content != (count + 1).toString()) return message.delete() // if the module "talking" isn't activated and there's some text after it, we delete it as well
        database.addToCount(message.guild.id, message.author.id); count += 1;
        let countMsg = message;
        if (modules.includes("reposting")) {
            if (!modules.includes("webhook")) {
                countMsg = await message.channel.send({
                    embed: {
                        description: "<@!" + message.author.id + ">: " + message.content,
                        color: message.member.displayColor ? message.member.displayColor : 3553598
                    }
                })
                message.delete()
                database.checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)
            } else message.channel.fetchWebhooks().then(async webhooks => {
                let foundHook = webhooks.find(webhook => webhook.name == 'Countr Reposting')
                
                if (!foundHook) { // create a new webhook
                    message.channel.createWebhook('Countr Reposting', client.user.avatarURL)
                        .then(async webhook => {
                            webhook.edit('Countr Reposting', client.user.avatarURL)
                            countMsg = await webhook.send(message.content, {
                                username: message.author.username,
                                avatarURL: message.author.displayAvatarURL
                            })

                            message.delete()
                            database.checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)
                        })
                } else countMsg = await foundHook.send(message.content, {
                    username: message.author.username,
                    avatarURL: message.author.displayAvatarURL
                })
                
                message.delete()
                database.checkSubscribed(message.guild.id, count, message.author.id, countMsg.id)

            }).catch();
        }
        
        return;
    }

    if (message.author.bot) return;

    if (content.startsWith("c!channel")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!");
        if (content.endsWith("none")) { database.saveCountingChannel(message.guild.id, "0"); message.channel.send(":white_check_mark: Unlinked counting channel."); }
        else { database.saveCountingChannel(message.guild.id, message.channel.id); message.channel.send(":white_check_mark: From now on, this channel will be used for counting."); }
    } else if (content.startsWith("c!reset")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
        database.setCount(message.guild.id, 0);
        
        return message.channel.send(":white_check_mark: Counting has been reset.");
    } else if (content.startsWith("c!toggle")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
        let arg = message.content.split(" ").splice(1)[0] // gets the first arg and makes it lower case
        if (!arg) {
            return message.channel.send(":clipboard: Modules: \`" + allModules.join("\`, \`") + "\` - To read more about them, go to the documentation page, `c!info` for link")
        }
        arg = arg.toLowerCase()
        let modules = await database.getModules(message.guild.id);
        if (allModules.includes(arg)) {
            return database.toggleModule(message.guild.id, arg)
              .then(() => { message.channel.send(":white_check_mark: Module \`" + arg + "\` now " + (!modules.includes(arg) ? "enabled" : "disabled") + ".") })
              .catch(() => { message.channel.send(":x: Something went wrong while trying to save to the database.") });
        } else {
            return message.channel.send(":x: Module does not exist.")
        }
    } else if (content.startsWith("c!subscribe")) {
        let number = parseInt(message.content.split(" ").splice(1)[0])
        if (!number) return message.channel.send(":x: Invalid count.")

        if (!database.getCount(message.guild.id)[0]) return message.channel.send(":x: There is no counting channel set up in this guild.")
        if (number <= database.getCount(message.guild.id)[0]) return message.channel.send(":warning: You can't subscribe to a count that's under the current count.")

        database.subscribe(message.guild.id, message.author.id, number)
        return message.channel.send(":white_check_mark: I will notify you when this server reach " + number + " total counts.")
    } else if (content.startsWith("c!topic")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don't have permission!")
        let topic = message.content.split(" ").splice(1).join(" ");

        let botMsg = await message.channel.send(":hotsprings: Saving...")

        database.setTopic(message.guild.id, topic).then(() => {
            if (topic.length == 0) return botMsg.edit(":white_check_mark: The topic has been cleared.")
            return botMsg.edit(":white_check_mark: The topic has been updated.")
        }).catch(() => {
            return botMsg.edit(":x: An unknown error occoured. Try again later.")
        })
    } else if (content.startsWith("c!set")) {
        if (!isAdmin(message.member)) return message.channel.send(":x: You don\'t have permission!")
        let count = parseInt(message.content.split(" ").splice(1)[0]) || -1;
        if (count < 0) return message.channel.send(":x: Invalid count.");
        database.setCount(message.guild.id, count)
        return message.channel.send(":white_check_mark: Success! Count set to " + count + ".")
    }

    await globalCode.command(client, settings, dbl, message);
})

function isAdmin(member) {
    return member.hasPermission("MANAGE_GUILD") || member.user.id == "110090225929191424";
}

client.login(JSON.parse(require("fs").readFileSync("./config.json")).token)

globalCode.logging(client)