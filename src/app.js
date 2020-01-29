#!/usr/bin/env node

const path = require('path')
const util = require('util')

require('dotenv').config()

const fs = require('fs-extra')
const yargs = require('yargs')
const { Signale } = require('signale')

const logger = new Signale()

let PubNub
if (process.env.PUBNUB_LOCAL) {
    PubNub = require(path.resolve(process.env.PUBNUB_LOCAL))
} else {
    PubNub = require('pubnub')
}

const pubnub = new PubNub({
    subscribeKey: process.env.SUBSCRIBE_KEY,
    publishKey: process.env.PUBLISH_KEY,
    secretKey: process.env.SECRET_KEY
})

yargs
    .commandDir('commands', {
        visit: (module, modulePath, filename) =>
            module({
                logger,
                pubnub
            })
    })
    .demandCommand()
    .strict()
    .showHelpOnFail(false)
    .help().argv
