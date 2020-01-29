const uuid = require('uuid/v4')

module.exports = {
    command: 'create-user',
    description: 'create user from Objects API',
    builder: yargs => {
        return yargs
            .option('id', {
                type: 'string',
                description: 'id of the user (auto-generated if not passed)'
            })
            .option('name', {
                type: 'string',
                description: 'name of the user',
                demand: true
            })
            .option('custom', {
                type: 'string',
                description: 'custom data attached to the user'
            })
    },
    handler: async ({ pubnub, argv }) => {
        const response = await pubnub.createUser({
            id: argv.id || uuid(),
            name: argv.name,
            custom: argv.custom && JSON.parse(argv.custom)
        })

        return response
    }
}
