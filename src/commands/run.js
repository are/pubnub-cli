const util = require('util')

function decorateHandler(handler, ctx) {
    return async argv => {
        try {
            const result = await handler({ argv, ...ctx })

            if (process.stdout.isTTY) {
                console.log(util.inspect(result, { depth: Infinity }))
            } else {
                console.log(JSON.stringify(result))
            }
        } catch (e) {
            ctx.logger.error(e)
        }
    }
}

module.exports = ctx => ({
    command: ['run <snippet>', '$0 <snippet>'],
    describe: 'Run a code snippet',
    builder: yargs => {
        return yargs
            .commandDir('snippets', {
                visit: (module, filePath, filename) => {
                    return {
                        ...module,
                        handler: decorateHandler(module.handler, ctx)
                    }
                }
            })
            .fail(error => {
                ctx.logger.error(error)
                process.exit(1)
            })
    }
})
