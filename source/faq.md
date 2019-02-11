# Frequently Asked Questions

These are questions we get asked a lot of in our ticket system. Yes, stupid people come with stupid questions.

#### How do I set up a counting channel?
Check out our [Quick Guide](/quickguide.html).

#### I tried to enable the module talking using `c!talking` but it doesnt work.
This is not a command. Use `c!toggle talking`. (or any other module)

#### I've already counted 1, but it just deletes 2!
To avoid spam, by default it cannot be the same user who counts twice in a row. If you want to disable this, type `c!toggle allow-spam`.

#### My count is glitched out, why? And how to fix?
This is common reasons we deal with every day:
* You or someone else deleted the previous count, so it looks messed up.
A fix could be to use `c!set` to set the count back. If this doesn't work, try to `c!reset` and then `c!set` again. To avoid this from happening, (stop deleting your messages and) enable the module `reposting`. This will repost the count so users can't self-delete.

#### Is there any way of avoiding a message getting deleted?
Yes, start your message with `!` and Countr will ignore your message as long as you have Manage Messages-permission.

#### What information is getting stored in your systems?
If you type `c!dumpconfig` (command coming soon), you can see what information we store on your guild.
When subscribing to a count in a guild, we store your user ID, the guild ID and what count you want to get notified of.
When setting up a role, we store the guild ID, the role ID, if you want to restrict it to only 1 person and what count the role will be rewarded.

#### Countr is slow, please fix.
We are aware it might be slow sometimes. If you want to support Countr and get me a better VPS it can be sitting on, please [support me on Patreon](https://patreon.com/gleeny).

#### I need further help!
Please join our [support server](https://discord.gg/SwY8ZBE).