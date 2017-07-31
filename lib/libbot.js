'use strict';

var Telegram = require('node-telegram-bot-api');

const api = {
    layer: 57,
    initConnection: 0x69796de9,
    api_id: 24275,
    app_version: '1.0.0',
    lang_code: 'en'
}
const server = {
    dev: false,
    webogram: false
}

function Bot (config) {
    var bot = new Telegram(config.bot_api_key, {polling: true});
    var main = new (require('./libnamer.js'))(config, bot)
    bot.getMe()
    .then(function (ret) {
        main.readyFor(ret.username);
        bot.on('message', main.run.bind(main));
        console.log('Bot: Ready.');
    })
}

module.exports = Bot
