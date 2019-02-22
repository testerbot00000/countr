# Admin Commands

These commands have a permission level of 2. This means anyone that have manage guild can access these commands.

### `c!addrole <role> <mode> <count> <duration>`

Add a role that get rewarded users on whatever count you want.
- `<role>`: This is the role you want to be rewarded. This can either be the name, mention or ID of the role. If you have spaces in your role name, replace those with underscores.
- `<mode>`: If you use "only", it will only be that count you specify. If you use "each", it will be each count in the multiplication table, example; 7 = 7, 14, 21, 28, 35 etc.
- `<count>`: This is the count you want the role to be triggered on.
- `<duration>`: If you use "temporary", the role will be removed from everyone already having it, and added to the new person. If you use "permanent", you keep the role unless someone removes it.
- `c!addrole Count_Champ each 1000 temporary`: This will give the user who counts 1000, 2000, 3000 etc. the role named Count Champ, and the last user who had the role lose it.
- `c!addrole 469523835595653120 only 420 permanent`: This will give every user who reach count 420 the role with the ID 469523835595653120, and will stay on the user forever unless someone removes it.

### `c!editrole <ID> <property> <value>`

Edit a role reward.
- `<ID>`: This is the ID of the role reward. This can be found if you type `c!roles`.
- `<property>`: This will be what you want to edit. Valid properties: "role", "mode", "count", "duration".
- `<value>`: See `c!addrole` above to see the different values for each property.
- `c!editrole MnRIf4 mode each`: This will change the Role Reward ID "MnRIf4"'s mode to "each".
- `c!editrole jPFj78 count 1337`: This will change the Role Reward ID "jPFj78"'s count to 1337.

### `c!link [channel]`

Link a counting channel.
- `[channel]`: Specify what channel you want to become the counting channel. This can either be the name, mention or ID of the channel. If it's empty, it will be the channel the command was sent in.
- `c!link #counting`: Link the channel called #counting.

### `c!removerole <ID>`

Remove a Role Reward.
- `<ID>`: This is the ID of the role reward. This can be found if you type `c!roles`.
- `c!removerole 4s2h2Q`: Remove the Role Reward with ID "4s2h2Q".

### `c!toggle [module]`

Toggle a module or get a list of modules.
- `[module]`: Specify what module you want to toggle. Leave emoty for a list of them.

### `c!topic <topic...>`

Set the topic.
- `<topic...>`: Set the topic to whatever you want. Use \`{{COUNT}}\` as a placeholder for the count. If you put "reset", it will reset back to default. If you put "disable", the topic will never change.
- `c!topic Count to infinity! Next count is {{COUNT}}.`: An example of using a placeholder.

### `c!unlink`

Unlink the current counting channel.

# Moderation Commands

These commands have a permission level of 1. This means anyone that have manage messages can access these commands.

### `c!reset`

Reset the count.

### `c!set <count>`

Set the count.
- `<count>`: Specify the count you want.