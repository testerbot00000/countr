<div style="background:white url(https://i.imgur.com/QiCG7sd.png) repeat fixed;">

<div align="center">

[![Discord Bots](https://discordbots.org/api/widget/status/467377486141980682.svg)](https://discordbots.org/bot/467377486141980682) [![Discord Bots](https://discordbots.org/api/widget/servers/467377486141980682.svg)](https://discordbots.org/bot/467377486141980682) [![Discord Bots](https://discordbots.org/api/widget/upvotes/467377486141980682.svg)](https://discordbots.org/bot/467377486141980682) [![Discord Bots](https://discordbots.org/api/widget/lib/467377486141980682.svg)](https://discordbots.org/bot/467377486141980682) [![Discord Bots](https://discordbots.org/api/widget/owner/467377486141980682.svg)](https://discordbots.org/bot/467377486141980682)

[![Discord Bots](https://discordbots.org/api/widget/467377486141980682.svg)](https://discordbots.org/bot/countr)

</div>

<p><strong>Countr</strong> is a simple counting bot and can be set up in 3 simple steps, explained.</p>

<ol>
<li>Add the bot using <a href="https://discordapp.com/api/oauth2/authorize?client_id=467377486141980682&amp;permissions=11280&amp;scope=bot">this</a> link. </li>

<li>Make a channel (for example #counting-channel)</li>

<li>Type <code>c!channel</code> in the channel you created</li>
</ol>

<p>That's it!</p>

<p>We have also made a bot tutorial on how to use the bot. <a href="https://vimeo.com/280228205">Watch the video on Vimeo.</a></p>

<hr />

<p><big>Purpose</big></p>

<p>There are different purposes:</p>

<ul>
<li>Guild administrators can give out prizes for each X counts</li>

<li>They can also hype the members up by trying to get a milestone</li>

<li>Or just have fun while counting to infinity.</li>
</ul>

<hr />

<p><big>Commands</big></p>

<p>| Command &amp; Usage       | Description                                           | Permissions    |
|:----------------------|:------------------------------------------------------|:---------------|
| <code>c!help</code> or <code>c!info</code>  | Get information about the bot                         |
| <code>c!channel</code>           | Set the channel to the guild's counting channel.      | <code>MANAGE_GUILD</code> |
| <code>c!channel none</code>      | Unlink the current channel.                           | <code>MANAGE_GUILD</code> |
| <code>c!reset</code>             | Reset the count back to 0.                            | <code>MANAGE_GUILD</code> |
| <code>c!toggle [module]</code>   | Toggle modules. Leave empty to get a list of modules. | <code>MANAGE_GUILD</code> |
| <code>c!subscribe &lt;count&gt;</code> | Subscribe to a count in the guild.                    |
| <code>c!topic [topic]</code>     | Set the topic. Leave empty to clear topic.            | <code>MANAGE_GUILD</code> |
| <code>c!set &lt;count&gt;</code>       | Set the count to a specific count                     | <code>MANAGE_GUILD</code> |</p>

<table style="background-color:rgba(0, 0, 0, 0);">
	<tr>
		<th>Command &amp; Usage</th>
		<th>Description</th>
		<th>Permission</th>
	</tr>
	<tr>
		<td><code>c!help</code> or <code>c!info</code></td>
		<td>Get information about the bot</td>
		<td></td>
	</tr>
	<tr>
		<td><code>c!channel</code></td>
		<td>Set the channel to the guild's counting channel.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
	<tr>
		<td><code>c!channel none</code></td>
		<td>Unlink the current channel.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
	<tr>
		<td><code>c!reset</code></td>
		<td>Reset the count back to 0.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
	<tr>
		<td><code>c!toggle [module]</code></td>
		<td>Toggle modules. Leave empty to get a list of modules.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
	<tr>
		<td><code>c!subscribe &lt;count&gt;</code></td>
		<td>Subscribe to a count in the guild.</td>
		<td></td>
	</tr>
	<tr>
		<td><code>c!topic [topic]</code></td>
		<td>Set the topic. Leave empty to clearr topic.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
	<tr>
		<td><code>c!set &lt;count&gt;</code></td>
		<td>Set the count to a specific count.</td>
		<td><code>MANAGE_GUILD</code></td>
	</tr>
</table>

<hr />

<p><big>Modules</big></p>

<p>| Module      | Description                                                                          | Bot Permissions   |
|:------------|:-------------------------------------------------------------------------------------|:------------------|
| <code>talking</code>   | Allow users to send a message after the count. Ex. <code>20 blabla</code>.                      |
| <code>reposting</code> | Make the bot repost the message, preventing the user to edit or delete the message.  | <code>EMBED_LINKS</code>     |
| <code>webhook</code>   | Make the bot send webhooks (requires the module <code>reposting</code>)                         | <code>MANAGE_WEBHOOKS</code> |</p>

<p>The <em>Bot Permissions</em> column shows what permissions the bot requires including the default ones. The default bot permissions are shown below.</p>

<hr />

<p><big>Permissions</big></p>

<p>If you're super pecky about giving bots permissions, read this:</p>

<ul>
<li>Read Messages


<ul>
<li>A basic permission that you should allow everyone to have. It requires to read the counting channel to see if there are any messages that are not part of the counting. It also requires to look for commands.</li></ul>
</li>

<li>Send Messages


<ul>
<li>Another basic permission. It requires to respond to the commands.</li></ul>
</li>

<li>Manage Channels


<ul>
<li>The topic of the channel is used to display the next number.</li>

<li>If you're going to restrict the bot's permissions to only work in the channel, you also need to give Countr "Manage Channels" in the category the channel is in. If it's not in a category, it's fine. (Bug report: https://github.com/discordjs/discord.js/issues/2533) </li></ul>
</li>

<li>Manage Messages


<ul>
<li>If a message is not part of the counting or not the next number in the counting, it deletes it.</li></ul>
</li>
</ul>

<p>If you want to, you can make these permissions only work in the counting channel.</p>

<hr />

<p><big>Contributors</big></p>

<ul>
<li><code>Main Developer and Designer</code> Promise - Gleeny (110090225929191424)</li>

<li><code>Helper and Beta Tester</code> GamesForDays (332209233577771008)</li>
</ul>

<p>Since we can change our names on Discord whenever we want, you can find us on the <a href="https://discord.gg/JbHX5U3">support server</a>.</p>

<hr />

<p><big>Vote for us</big></p>

<p>To support us free, please vote on our bot at these bot sites:</p>

<ul>
<li><a href="https://discordbots.org/bot/countr">DiscordBots.org</a> (main bot site)</li>
</ul>

<p>I don't like money donations, but a vote would mean a lot :)</p>

<hr />

<p><big>Keep in mind!</big></p>

<ul>
<li>To avoid spam of the bot and the channel, you can only send a number after someone else has.</li>

<li>You can reset the counter with <code>c!reset</code> and change the count with <code>c!set</code>.</li>

<li>If you want to bypass the deletion of a message, type <code>!</code> before the message. You can edit the message afterwards.</li>

<li>The only information we store in our systems are:


<ul>
<li>The counting channel ID</li>

<li>How many counts in that channel</li>

<li>The user ID of the last count in that channel</li>

<li>Global counts (for the activity of the bot)</li></ul>
</li>

<li>By using our bot you also agree that changes can be made and downtime can occour.</li>
</ul>

<p>Any other questions can go to our <a href="https://discord.gg/JbHX5U3">support server</a>.</p>

<hr />

<div align="center">

[![Discord Bots](https://discordbots.org/api/widget/472842075310653447.svg)](https://discordbots.org/bot/472842075310653447)
[![Discord Bots](https://discordbots.org/api/widget/475041313515896873.svg)](https://discordbots.org/bot/475041313515896873)

</div>