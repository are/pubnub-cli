#!/usr/bin/env node

require('dotenv').config()

const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const yargs = require('yargs')
const pino = require('pino')
const uuid = require('uuid/v4')

let PubNub
if (process.env.PUBNUB_LOCAL) {
    PubNub = require(path.resolve(process.env.PUBNUB_LOCAL))
} else {
    PubNub = require('pubnub')
}

const logger = pino({
    level: process.stdout.isTTY ? 'debug' : 'silent',
    prettyPrint: process.stdout.isTTY
})

const pubnub = new PubNub({
    subscribeKey: process.env.SUBSCRIBE_KEY,
    publishKey: process.env.PUBLISH_KEY,
    secretKey: process.env.SECRET_KEY
})

const FILTER_LIST = ['node_modules']

async function getSnippets(dirPath) {
    const dir = await fs.promises.opendir(dirPath)

    const result = []

    for await (const entry of dir) {
        if (!entry.isDirectory()) {
            if (entry.name.endsWith('.snippet.js')) {
                result.push({
                    type: 'file',
                    name: path.basename(entry.name, '.snippet.js')
                })
            }

            continue
        }

        if (FILTER_LIST.includes(entry.name)) {
            continue
        }

        const doesEntrypointExist = await fs.exists(
            path.resolve(dirPath, entry.name, 'index.js')
        )
        if (!doesEntrypointExist) {
            continue
        }

        result.push({ type: 'dir', name: entry.name })
    }

    return result
}

yargs
    .command(
        ['run <snippet>', '$0 <snippet>'],
        'run a snippet',
        yargs => {
            yargs
                .positional('snippet', {
                    describe: 'name of a snippet inside snippets directory',
                    type: 'string'
                })
                .option('r', {
                    alias: 'restore',
                    boolean: true,
                    default: false
                })
        },
        argv => {
            runSnippet(argv).catch(e => {
                logger.error(e.message)
            })
        }
    )
    .help().argv

async function runSnippet(argv) {
    const cacheDir = path.resolve(__dirname, '.cache')
    await fs.ensureDir(cacheDir)

    const snippetNames = await getSnippets(path.resolve(__dirname, 'snippets'))
    const snippet = snippetNames.find(snippet => snippet.name === argv.snippet)

    if (!snippet) {
        throw new Error(`Snippet '${argv.snippet}' cannot be found`)
    }

    const requirePath =
        snippet.type === 'dir'
            ? path.resolve(__dirname, 'snippets', snippet.name)
            : path.resolve(__dirname, 'snippets', `${snippet.name}.snippet.js`)

    let module
    try {
        module = require(requirePath)
    } catch (error) {
        throw new Error(`Cannot run snippet (${requirePath}): ${error.message}`)
    }

    if (typeof module !== 'function') {
        throw new Error(`Snippet module has to export a function`)
    }

    let result
    if (!argv.restore) {
        let moduleResult

        try {
            moduleResult = await module({
                pubnub,
                logger,
                argv
            })
        } catch (error) {
            if (error.status) {
                throw new Error(
                    `PubNub response error:\n${util.inspect(error.status, {
                        depth: Infinity
                    })}`
                )
            } else {
                throw new Error(
                    `An error has occured while running the snippet:\n${error.message}`
                )
            }
        }

        result = JSON.stringify(moduleResult)

        await fs.writeFile(path.resolve(cacheDir, snippet.name), result)
    } else {
        const cacheFile = path.resolve(cacheDir, snippet.name)
        if (await fs.pathExists(cacheFile)) {
            result = await fs.readFile(cacheFile, 'utf8')
        } else {
            throw new Error(
                'To restore response from cache you need to run the snippet first.'
            )
        }
    }

    console.log(result)
}
