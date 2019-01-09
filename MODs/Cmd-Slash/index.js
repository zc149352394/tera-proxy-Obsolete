String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}` }

module.exports = function CmdSlash(d) {

	d.command.add('r', () => {
		d.toServer('C_RESET_ALL_DUNGEON', 1, {})
		send(`重置副本`.clr('56B4E9'))
	})

	d.command.add('d', () => {
		d.toServer('C_LEAVE_PARTY', 1, {})
		send(`退出队伍`.clr('56B4E9'))
	})

	d.command.add('b', () => {
		d.toClient('S_NPC_MENU_SELECT', 1, {type: 28})
		send(`打开交易所`.clr('56B4E9'))
	})

	
	d.command.add('t', () => {
		d.toClient('S_NPC_MENU_SELECT', 1, {type: 77})
		send(`talent`.clr('56B4E9'))
	})

	d.command.add(['l', 'q'], () => {
		d.toServer('C_RETURN_TO_LOBBY', 1, {})
		send(`返回大厅`.clr('56B4E9'))
	})

	function send(msg) {
		d.command.message(msg)
	}

}
