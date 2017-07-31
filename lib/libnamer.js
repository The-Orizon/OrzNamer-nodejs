/* libnamer.js
 * Type: TelegramMessage: https://core.telegram.org/bots/api#message
 */

/* words: split string like 'prefix - foo - bar' into ['foo', 'bar']
 * String => String[]
 * 
 * words: join array like ['foo', 'bar'] into 'prefix - foo - bar'
 * String[] => String
 */
var $d = require('./libdelay.js')
const svg2png = require("svg2png");
const color = require('deltae');
const fs = require('fs')

function words(_, prefix) {
    if (Array.isArray(_)) {
        return [prefix].concat(_).join(' - ');
    } else {
        var words = _.substring(prefix.length + 3).split(' - ');
        return words[0] == '' ? [] : words;
    }
}
function getcmd(str, name) {
    var cmd = (str.split(' '))[0].split('@');
    if (cmd.length > 2) return;
    if (cmd.length == 2 && cmd[1] != name) return;
    return cmd[0].substr(1);
}

function Namer(config, bot) {
    this.config = config
    this.prefix = config.prefix
    this.bot = bot
    this.currentTitle = []
    this.readOrigin = false
    this.debugMode = false
}

Namer.prototype.readyFor = function (username) {
    this.username = username;
}

var runHelper = (function (command) {
    /* run: excute the command
    * String => undefined
    */
    return function (message) {
        console.log('Bot: Incoming msg. ' + message.text);
        if (message.text && message.chat.id == (-this.config.target_channel - Math.pow(10, 12))) {
            // update this title for modify
            if (this.readOrigin) this.currentTitle = words(message.chat.title, this.prefix)
            debugger
            var cmd = getcmd(message.text, this.username);
            if (cmd === undefined) return;

            var msg = message.text.split(' ')
            msg.shift()
            msg = msg.join(' ')
            var replyMessage = (command[cmd] || new Function()).bind(this)(message, msg);
            replyMessage && this.bot.sendMessage(message.chat.id, replyMessage);
        }
    }
})
    /* Commands config: command will receive a message when /command or /command@botName is called
     * if command handler return a String, bot will send this string to the group
     * 
     * Anonymous function: handle the command
     * String => String
     * String => undefined
     */
    ({
        /* tclear: clean all sub titles */
        'tclear': function () {
            this.currentTitle = []
            this.updateName()
        },
        'tdebug': function () {
            this.debugMode = !this.debugMode
            return '喵QAQ要对咱做什么！\n' + (this.debugMode ? '现在可以调教 0.0' : '现在不能调教（')
        },

        /* tadd: add message to the front */
        'tadd': function (message, msg) { (msg != '' && msg.length < (256 / 2)) && this.doAdd(msg, message, 'front'); },
        /* tpush: add message to the end */
        'tpush': function (message, msg) { (msg != '' && msg.length < (256 / 2)) && this.doAdd(msg, message, 'end'); },
        /* tlen: return the length of the title */
        'tlen': function (message) {
            return '喵...当前标题长度是 ' + (message.chat.title.length * 2);
        },
        /* tcat: return the current title */
        'tcat': function (message) {
            return message.chat.title;
        },
        /* thelp: return the help message */
        'thelp': function () {
            return '笨蛋......好好读命令列表啦。';
        },
        'tlogo': function (message, msg) {
            const colorReg = /^[#]{0,1}([0-9a-fA-F]{6})\s[#]{0,1}([0-9a-fA-F]{6})$/
            const colorSepReg = /^[#]{0,1}([0-9a-fA-F]{6})\s[#]{0,1}([0-9a-fA-F]{6})\s[#]{0,1}([0-9a-fA-F]{6})\s[#]{0,1}([0-9a-fA-F]{6})$/
            const templateReg = /^template:([0-9a-zA-Z]+)$/
            // bg: 0, fg: 1
            if (colorReg.test(msg)) {
                let colorScheme = colorReg.exec(msg)
                let fg = colorScheme[2],
                    bg = colorScheme[1]
                if (color.delta(fg, bg) >= 10) {
                    let svg = require('../rendersvg.js')(bg, fg, fg, fg)
                    svg2png(svg)
                        .then(buffer => this.bot.setChatPhoto(this.config.target, buffer))
                        .catch(e => console.error(e))
                } else {
                    return '我看不见字了qwq'
                }
            } else if (colorSepReg.test(msg)) {
                let colorScheme = colorSepReg.exec(msg)
                let fgo = colorScheme[2],
                    fgr = colorScheme[3],
                    fgz = colorScheme[4],
                    bg = colorScheme[1]
                if (color.delta(fgo, bg) >= 10 && color.delta(fgr, bg) >= 10 && color.delta(fgz, bg) >= 10) {
                    let svg = require('../rendersvg.js')(bg, fgo, fgr, fgz)
                    svg2png(svg)
                        .then(buffer => this.bot.setChatPhoto(this.config.target, buffer))
                        .catch(e => console.error(e))
                } else {
                    return '我看不见字了qwq'
                }
            } else if (templateReg.test(msg)) {
                let name = templateReg.exec(msg)[1].toLowerCase()
                let path = './templates/' + name + '.png'
                try {
                    let photo = fs.readFileSync(path)
                    this.bot.setChatPhoto(this.config.target, photo)
                        .catch(e => console.error(e))
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        console.error(path + ' does not exist');
                        return '模板什么的届不到啦。';
                    }
                }
            } else {
                return '用法错误啦喵~'
            }
        },
        'tdelay': function (message, time) {
            this.bot.getChatAdministrators(message.chat.id)
                .then((ret) => {
                    if (ret.some(child => child.user.id == message.from.id)) {
                        var t = parseInt(time)
                        if (typeof t != typeof 1) void 0
                        else {
                            this.config.delay = t;
                            return this.bot.sendMessage(message.chat.id, '喵~现在延迟是 ' + (t / 1000) + ' 秒哦', { reply_to_message_id: message.message_id });
                        }
                    } else return this.bot.sendMessage(message.chat.id, '笨蛋，咱不会听你话的。', { reply_to_message_id: message.message_id });
                });
        },
        'tping': function () {
            debugger
            return '大家好, 这里是美雲このは, 请多指教～';
        }
    })

Namer.prototype.run = function (msg) {
    runHelper.bind(this)(msg)
}

/* updateName: update the name of the group */
var updateHelper = (function () {
    function doUpdate() {
        var title = words(this.currentTitle, this.prefix)
        title = title.replace(/\n/g, ' ');
        console.log('Bot: Title is set to ' + title)
        // this.bot.sendChatAction(this.config.target_channel.in_bot, '
        // if(!this.debugMode) this.cli.stdin.write('rename_channel channel#id' + this.config.target_channel + ' ' + title + '\n', 'utf8');
        if (!this.debugMode) this.bot.setChatTitle(this.config.target, title)

            .catch((e) => {
                this.bot.sendMessage(this.config.target, 'OAO 啊哦...爆炸了...请重试\n')
            })
        else this.bot.sendMessage(this.config.target, '当前标题应该是 ' + title)

    }
    return function updateName() {
        this.bot.sendChatAction(this.config.target, 'typing');
        $d(this.config.delay).then(doUpdate.bind(this), new Function())
    }
})()
Namer.prototype.updateName = function (title) {
    updateHelper.bind(this)(title)
}

/* doAdd: add a new sub title to the end or the start
 * (String, TelegramMessage, ?'end') => undefined
 */
Namer.prototype.doAdd = function doAdd(content, msg, direction) {
    var operateRemove = direction == 'end' ? function shift() { this.currentTitle.shift(); } : function pop() { this.currentTitle.pop(); }
    var operateAdd = direction == 'end' ? function push(v) { this.currentTitle.push(v); } : function unshift(v) { this.currentTitle.unshift(v); }
    var cont = cont = content.replace(/\s-\s/g, " ");
    while (cont.match(/\s-\s/g) != null) cont = cont.replace(/\s-\s/g, " ");
    operateAdd.bind(this)(cont);
    while (words(this.currentTitle, this.prefix).length * 2 >= 255) operateRemove.bind(this)();
    this.updateName();
}
module.exports = Namer;
