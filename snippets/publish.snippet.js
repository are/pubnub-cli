module.exports = async ({ pubnub, argv }) => {
    let channel
    if (argv.c !== undefined) {
        channel = argv.c
    } else if (argv.channel !== undefined) {
        channel = argv.channel
    }

    if (!channel) {
        throw new Error(
            'You must pass in a channel name using `-c <name>` or `--channel <name>`.'
        )
    }

    let message
    if (argv._[0] !== undefined) {
        message = argv._[0]
    } else if (argv.message !== undefined) {
        message = argv.message
    } else if (argv.m !== undefined) {
        message = argv.m
    } else if (argv.json !== undefined) {
        message = JSON.parse(argv.json)
    }

    if (!message) {
        throw new Error(
            'You must pass in a message as a last argument, using `-m <message>`, `--message <message>`, `--json <json>`.'
        )
    }

    const response = await pubnub.publish({
        channel: channel,
        message: message,
        meta: argv.meta ? JSON.parse(argv.meta) : undefined,
        ttl: argv.ttl ? parseFloat(argv.ttl) : undefined
    })

    return response
}
