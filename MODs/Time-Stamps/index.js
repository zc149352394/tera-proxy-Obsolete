String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function TimeStamps(d) {
    const blocked = new Set()

	let enabled = config.enabled
	let	debug = false

    d.command.add(`ts`, (cmd, sub) => {
        switch (cmd) {
            case 'debug': 
                debug = !debug
                d.command.message(`debug mode: ${debug ? "on" : "off"}`)
                break
            case 'on':
                d.command.message(enabled ? '模块已启用'.clr('FF0000') : '启用模块'.clr('56B4E9'))
                enabled = true
                break
            case 'off':
                d.command.message(enabled ? '禁用模块'.clr('E69F00') : '模块已禁用'.clr('FF0000'))
                enabled = false
                break
            default:
                enabled = !enabled
                d.command.message('时间戳 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
                break
        }
    })

    d.hook('S_ADD_BLOCKED_USER', 2, block)
    d.hook('S_USER_BLOCK_LIST', 2, sUserBlockList)
	d.hook('C_REMOVE_BLOCKED_USER', 1, cRemoveBlockedUser)
	d.hook('S_LOGIN', 10, sLogin)
    d.hook('S_CHAT', 2, processChatEvent)
    d.hook('S_PRIVATE_CHAT', 1, processChatEvent)

	function sUserBlockList(event) {
        event.blockList.forEach(block)
    }

	function cRemoveBlockedUser(event) {
        blocked.delete(event.name)
    }

	function sLogin(event) {
        blocked.clear()
    }

    function block(user){
        blocked.add(user.name)
    }

    function processChatEvent(event) {
        if (enabled) {
            if (event.channel === 26) return
            if (blocked.has(event.authorName)) return false
			event.authorName = `</a>${getFormattedTime()}][<a href='asfunction:chatNameAction,${event.authorName}@0@0'>${event.authorName}</a>`
            if (debug) console.log(event)
        }
        return true
    }
/*
    function processLfgEvent(event) {
        if (enabled) {
            if(event.channel === 26) return
            if(blocked.has(event.authorName)) return false
            event.name = `</a>${getFormattedTime()}][<a href='asfunction:chatNameAction,${event.name}@0@0'>${event.name}</a>`
            if (debug) console.log(event);
        }
        return true
    }
*/
    function getFormattedTime() {
        var time = new Date()
        var tt = time.toLocaleDateString('en-US', {hour: '2-digit', minute: 'numeric', hour12: true}).slice(-2).trim()
        var hh = time.getHours()
        var mm = time.getMinutes()
		var ss = time.getSeconds()
/*
        hh = hh % 12
        hh = hh ? (hh < 10 ? '0' + hh : hh) : 12
*/
		hh = hh < 10 ? '0' + hh : hh
        mm = mm < 10 ? '0' + mm : mm
		ss = ss < 10 ? '0' + ss : ss
/*
		switch (tt) {
			case 'AM':
				tt = '上午'
				break
			case 'PM':
				tt = '下午'
				break;
			default :
				break
		}
*/
		return `${hh}:${mm}:${ss}`
    }

}
