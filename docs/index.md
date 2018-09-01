---
layout: page
---

<div align="center">
<a href="http://discordbots.org/bot/Countr"><img src="https://discordbots.org/api/widget/status/467377486141980682.svg"><img src="https://discordbots.org/api/widget/servers/467377486141980682.svg"><img src="https://discordbots.org/api/widget/upvotes/467377486141980682.svg"><img src="https://discordbots.org/api/widget/lib/467377486141980682.svg"><img src="https://discordbots.org/api/widget/owner/467377486141980682.svg"></a>
        
<p><a href="http://discordbots.org/bot/Countr"><img src="https://discordbots.org/api/widget/467377486141980682.svg"></a>
</div>
        
<p><b>Countr</b> is a simple counting bot and can be set up in 3 simple steps, explained.<ol>
    <li>Add the bot using <a href="https://discordapp.com/api/oauth2/authorize?client_id=467377486141980682&permissions=11280&scope=bot">this</a> link.</li>
    <li>Make a channel (for example #counting channel), or use an existing channel.</li>
    <li>Type <code>c!channel</code> in the channel you created.</li>
</ol>
        
That's it! To make it easier, we've made a simple bot tutorial on how to use the bot. <a href="https://vimeo.com/280228205">Watch the video on Vimeo.</a>
<hr />
<p><b>Purpose</b>
        
<p>There are different purposes:<ul>
    <li>Guild administrators can give out prizes for each X counts</li>
    <li>They can also hype the members up by trying to get a milestone</li>
    <li>Or just have fun while counting to infinity.</li>
</ul>
<hr />
<p><b>Commands</b>
        
<p id="commands"></p>

<hr />
<p><b>Permissions</b>
<p>If you're super pecky about giving bots permissions, read this first!
        
<ul>
	<li>Read Messages<ul>
		<li>A basic permission that you should allow everyone to have. It requires to read the counting channel to see if there are any messages that are not part of the counting. It also requires to look for commands.</li></ul></li>
	<li>Send Messages<ul>
		<li>Another basic permission. It requires to respond to the commands.</li></ul></li>
	<li>Manage Channels<ul>
		<li>The topic of the channel is used to display the next number.</li>
		<li>If you're going to restrict the bot's permissions to only work in the channel, you also need to give Countr "Manage Channels" in the category the channel is in. If it's not in a category, it's fine. (<a href="https://github.com/discordjs/discord.js/issues/2533">Bug Report</a>)</li></ul></li>
	<li>Manage Messages<ul>
		<li>If a message is not part of the counting or not the next number in the counting, it deletes it.</li></ul></li>
</ul>
        
<p>If you want to, you can make these permissions only work in the counting channel.</p>
<hr />
<p><b>Contributors</b>
        
<p id="contributors"></p>
        
<hr />
<p><big>Keep in mind!</big></p>
<ul>
    <li>To avoid spam of the bot and the channel, you can only send a number after someone else has.</li>
	<li>You can reset the counter with <code>c!reset</code> and change the count with <code>c!set</code>.</li>
	<li>If you want to bypass the deletion of a message, type <code>!</code> before the message. You can edit the message afterwards.</li>
	<li>The only information we store in our systems are:<ul>
		<li>The counting channel ID</li>
		<li>How many counts in that channel</li>
		<li>The user ID of the last count in that channel</li>
		<li>Global counts (for the activity of the bot)</li></ul></li>
	<li>By using our bot you also agree that changes can be made and downtime can occour.</li>
</ul>

<script>
let settings = {"commands":[{"command":"help","args":"","example":"","description":"Gives you this message."},{"command":"channel","args":"","example":"","description":"Set the channel to the guild's counting channel."},{"command":"channel none","args":"","example":"","description":"Unlink the current counting channel."},{"command":"reset","args":"","example":"","description":"Reset the count back to 0."},{"command":"toggle","args":"[module]","example":"toggle talking","description":"Toggle modules. Leave empty to get a list of modules."},{"command":"subscribe","args":"<count>","example":"subscribe 1000","description":"Subscribe to a count in the guild."},{"command":"topic","args":"[topic]","example":"topic Count to infinity!","description":"Set the topic. Leave empty to clear topic."},{"command":"set","args":"<count>","example":"set 1337","description":"Set the count to a specific count."}],"contributors":[{"user":"Promise","userID":"110090225929191424","role":"Main Developer and Designer"},{"user":"GamesForDays","userID":"332209233577771008","role":"Helper and Beta Tester"}],"prefix":"c!","embedColor":{"ok":4437377,"err":15746887,"warn":16426522}};

// COMMANDS
let html = '<table><thead><tr><th style="text-align:left;">Command &amp; Usage</th><th style="text-align:left;">Description</th></tr></thead><tbody>';
        
function formatCommand(command, index) {
    html = html + '<tr><td style="text-align:left;"><code>' + settings.prefix + command.command + (command.args ? " " + command.args : "") + "</code></td>" + '<td style="text-align:left;">' + command.description + "</td></tr>";
}
        
settings.commands.forEach(formatCommand);
        
html = html + '</tbody></table>';
document.getElementById("commands").innerHTML = html;

// CONTRIBUTORS
let html = '<ul>';
        
function formatContributor(contributor, index) {
    html = html + '<li>' + contributor.role + ' ' + contributor.user + ' ' + contributor.userID + '</li>';
}
        
settings.contributors.forEach(formatContributor);
        
html = html + '</ul>';
document.getElementById("contributors").innerHTML = html;

</script>