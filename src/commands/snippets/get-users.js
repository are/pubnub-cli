module.exports = {
    command: 'get-users',
    description: 'get users from Objects API',
    builder: yargs => {
        return yargs
            .option('limit', {
                type: 'number',
                description: 'limit the amount of objects'
            })
            .option('filter', {
                type: 'string',
                description: 'expression to filter the objects'
            })
            .option('next', {
                type: 'string',
                description: 'next page identifier'
            })
            .option('prev', {
                type: 'string',
                description: 'previous page identifier'
            })
            .option('includeCustomFields', {
                type: 'boolean',
                description: 'include custom fields in the response'
            })
    },
    handler: async ({ pubnub, argv }) => {
        const response = await pubnub.getUsers({
            limit: argv.limit,
            filter: argv.filter,
            page: {
                next: argv.next,
                prev: argv.prev
            },
            include: {
                customFields: argv.includeCustomFields
            }
        })

        return response
    }
}
