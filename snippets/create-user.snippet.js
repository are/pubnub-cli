const uuid = require('uuid/v4')

module.exports = async ({ pubnub, logger, argv }) => {
    const response = await pubnub.createUser({
        id: argv.id || uuid(),
        name: argv.name || 'default name',
        custom: argv.custom ? JSON.parse(argv.custom) : undefined
    })

    return response
}
