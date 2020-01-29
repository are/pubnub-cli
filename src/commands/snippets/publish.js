module.exports = {
    command: 'publish <channel> [message]',
    description: 'publish a message to a channel',
    builder: yargs => {
        return yargs
            .positional('channel', {
                type: 'string',
                description: 'channel to publish to'
            })
            .positional('message', {
                type: 'string',
                description: 'send the message as a string'
            })
            .option('json', {
                type: 'string',
                description: 'send the message as an object'
            })
            .check(argv => {
                if (argv.json === undefined && argv.message === undefined) {
                    throw new Error(
                        'You must either use --json option or pass a string message'
                    )
                }

                return true
            })
    },
    handler: async ({ pubnub, argv }) => {
        const channel = argv.channel

        let message = argv.message
        if (argv.json) {
            message = JSON.parse(argv.json)
        }

        const response = await pubnub.publish({
            channel: channel,
            message: message,
            meta: argv.meta ? JSON.parse(argv.meta) : undefined,
            ttl: argv.ttl ? parseFloat(argv.ttl) : undefined
        })

        return response
    }
}
