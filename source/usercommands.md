# User Commands

These commands have a permission level of 0. This means anyone can access these commands.
Some commands are missing, because documenting those are unnecessary. (for example "ping")

### `c!help [command]`

Get a link to the documentation or get help on a command.
- `[command]`: Get help on a command.
- `c!help`: Get link to the documentation.
- `c!help help` Get help for the command help. (so stupid though)

### `c!notifs`

Get a list of your notifications in the server.

### `c!notifyme [each] <count>`

Get a notification whenever the server reach whatever count you want.
- `[each]`: If you use "each" here, it will be each count in the multiplication table, example; 9 = 9, 18, 27, 36, 45 etc.
- `<count>`: This is the count you want to get notified of.
- `c!notifyme each 1000`: Whenever the server reach 1000, 2000, 3000 etc. you will be notified in DMs.
- `c!notifyme 420`: Whenever the server reach the count 420, you will be notified in DMs.

### `c!removenotif <ID>`

Remove a notification.
- `<ID>`: This is the notification ID. All your notification IDs can be found in `c!notifs`.
- `c!removenotif v43ThQ`: Remove notification with ID "v43ThQ".

### `c!roles`

Get a list of role rewards in the server.