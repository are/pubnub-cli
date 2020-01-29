module.exports = async ({ pubnub, argv }) => {
    const response = await pubnub.getUsers({
        limit: argv.limit || undefined,
        filter: argv.filter || undefined,
        page: {
            next: argv.next || undefined,
            prev: argv.prev || undefined
        },
        include: {
            customFields: argv.includeCustomFields || undefined
        }
    })

    return response
}
