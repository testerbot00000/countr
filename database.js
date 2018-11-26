const mongoose = require("mongoose");
mongoose.connect(JSON.parse(require("fs").readFileSync("./config.json")).database_uri, { useNewUrlParser: true });

const guildSchema = mongoose.Schema({
  guildid: String,
  channel: String,
  count: Number,
  user: String,
  modules: [],
  subscriptions: {},
  topic: String
}, { minimize: false })

const subscribeSchema = mongoose.Schema({
  guildid: String,
  user: String,
  count: Number
}, { minimize: false })

const roleSchema = mongoose.Schema({
    guildid: String,
    mode: String,
    count: Number,
    duration: String,
    roleid: String
}, { minimize: false })

const Guild = mongoose.model("Guild", guildSchema);
const Subscribe = mongoose.model("Subscribe", subscribeSchema);
const Role = mongoose.model("Role", roleSchema);

module.exports = function(client) { return {
    saveCountingChannel(guildid, channelid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            guild.channel = channelid;
            guild.save().then(resolve).catch(reject);
        });
    },
    getCountingChannel(guildid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            resolve(guild.channel)
        })
    },
    addToCount(guildid, userid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            guild.count += 1;
            guild.user = userid;
            await guild.save().then(resolve).catch(reject);
            updateTopic(guildid, client)
        })
    },
    getCount(guildid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            resolve({ "count": guild.count, "user": guild.user })
        })
    },
    setCount(guildid, count) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            guild.count = count;
            guild.user = "";
            await guild.save().then(resolve).catch(reject);
            updateTopic(guildid, client)
        })
    },
    toggleModule(guildid, moduleStr) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            if (guild.modules.includes(moduleStr)) guild.modules = guild.modules.filter(str => str !== moduleStr)
            else guild.modules.push(moduleStr)
            guild.save().then(resolve).catch(reject);
        })
    },
    getModules(guildid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            resolve(guild.modules);
        })
    },
    subscribe(guildid, userid, count) {
        return new Promise(async function(resolve, reject) {
            Subscribe.findOne({
                guildid: guildid,
                user: userid,
                count: count
              }, (err, subscribe) => {
                if (err) return reject(err);
                if (!subscribe) subscribe = new Subscribe({
                  guildid: guildid,
                  user: userid,
                  count: count
                });
                
                subscribe.save().then(resolve).catch(reject);
              });
        })
    },
    checkSubscribed(guildid, count, countUser, messageID) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);

            let subs = await new Promise(function(resolve, reject) {
                Subscribe.find({
                    guildid: guildid,
                    count: count
                }, (err, subscribes) => {
                    if (err) return reject(err);
                    let subs = [];
                    subscribes.forEach(sub => {
                        subs.push(sub.user);
                        Subscribe.deleteOne({
                            guildid: guildid,
                            user: sub.user,
                            count: count
                        }, function(err) {})
                    });
            
                    return resolve(subs);
                });
            })

            await subs.forEach(async userID => {
                try { await client.guilds.get(guildid).members.get(userID).send("The guild " + client.guilds.get(guildid).name + " just reached " + count + " total counts! :tada:\nThe user who sent it was <@" + countUser + ">\n[<https://discordapp.com/channels/" + guildid + "/" + guild.channel + "/" + messageID + ">]"); } catch(e) {}
            });

            resolve(true)
        })
    },
    setTopic(guildid, topic) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            if (["disable", ""].includes(guild.topic)) guild.topic = topic; else guild.topic = topic + (topic.includes("{{COUNT}}") ? "" : (topic == "" ? "" : " | ") + "**Next count:** {{COUNT}}")
            await guild.save().then(resolve).catch(reject);
            updateTopic(guildid, client)
        })
    },
    getTopic(guildid) {
        return new Promise(async function(resolve, reject) {
            let guild = await getGuild(guildid);
            resolve(guild.topic)
        })
    },
    getChannelCount() {
        return new Promise(async function(resolve, reject) {
            Guild.find({}, (err, guilds) => {
                if (err) return reject(err);
                let count = 0;
                guilds.forEach(guild => { if (guild.channel != "") count += 1; })

                return resolve(count);
            })
        })
    },
    setRole(guildid, mode, count, duration, roleid) {
        return new Promise(async function(resolve, reject) {
            Role.findOne({
                guildid: guildid,
                roleid: roleid
            }, (err, role) => {
                if (err) return reject(err);
                if (!role) role = new Role({
                    guildid: guildid,
                    roleid: roleid
                })

                role.mode = mode;
                role.count = count;
                role.duration = duration;
                role.save().then(resolve).catch(reject);
            })

        })
    },
    checkRole(guildid, count, userid) {
        return new Promise(async function(resolve, reject) {
            Role.find({
                guildid: guildid
            }, async (err, roles) => {
                if (err) return reject(err);
                roles.forEach(roleInfo => {
                    if ((roleInfo.mode == "each" && Number.isInteger(count / roleInfo.count)) || (roleInfo.mode == "once" && count == roleInfo.count)) {
                        try {
                            if (roleInfo.duration == "temporary") client.guilds.get(guildid).roles.find(r => r.id == roleInfo.roleid).members.filter(m => m.id != userid).forEach(member => { member.removeRole(client.guilds.get(guildid).roles.find(r => r.id == roleInfo.roleid), "Countr Role") })
                            client.guilds.get(guildid).members.get(userid).addRole(client.guilds.get(guildid).roles.find(r => r.id == roleInfo.roleid), "Countr Role")
                        } catch(e) {}
                    }
                })
            })
        })
    }
}}

function getGuild(guildid) {
    return new Promise(function(resolve, reject) {
        Guild.findOne({
            guildid: guildid
        }, (err, guild) => {
            if (err) return reject(err);
            if (!guild) {
                let newGuild = new Guild({
                    guildid: guildid,
                    channel: "",
                    count: 0,
                    user: "",
                    modules: [],
                    subscriptions: {},
                    topic: "",
                    role: {}
                })

                return resolve(newGuild);
            } else return resolve(guild);
        })
    })
}

function updateTopic(guildid, client) {
    return new Promise(async function(resolve, reject) {
        let guild = await getGuild(guildid);
        try {
            if (guild.topic == "") await client.guilds.get(guildid).channels.get(guild.channel).setTopic("**Next count:** " + (guild.count + 1))
            else if (guild.topic != "disable") await client.guilds.get(guildid).channels.get(guild.channel).setTopic(guild.topic.replace("{{COUNT}}", (guild.count + 1)))
        } catch(e) {}
        resolve(true);
    })
}