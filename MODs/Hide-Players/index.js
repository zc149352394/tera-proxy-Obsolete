String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function HidePlayers(d) {

	let enabled = config.enabled,
		enableParty = config.enableParty,
		instance = config.instance

	let guild = [],
		myGameId = 0,
		myZone = 0,
		party = [],
		visibleRange = 0

	// command
	d.command.add(['hide', 'h'], (arg) => {
		// toggle
		if (!arg) {
			enabled = !enabled
			refresh()
			send('隐藏玩家 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
		// hide/show all player
		} else if (arg === 'p' || arg === 'party') {
			enableParty = !enableParty
			refresh()
			send('公会/组队成员 ' + (enableParty ? '显示'.clr('56B4E9') : '隐藏'.clr('E69F00')))
		// refresh
		} else if (arg === 'r' || arg === 'refresh') {
			refresh()
			send('刷新显示'.clr('56B4E9'))
		} else send('无效的参数'.clr('FF0000'))
	})

	d.hook('C_SET_VISIBLE_RANGE', 1, cSetVisibleRanga)
	d.hook('S_LEAVE_PARTY', 1, sLeaveParty)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_FEARMOVE_STAGE', 1, sFearmoveStage)
	d.hook('S_FEARMOVE_END', 1, sFearmoveEnd)
	d.hookOnce('S_GET_USER_LIST', 14, sGetUserList)
	d.hook('S_PARTY_MEMBER_LIST', 7, sPartyMemberList)
	d.hook('S_SPAWN_USER', 13, sSpawnUser)

	// code
	function cSetVisibleRanga(e) {
		visibleRange = e.range
	}
	// reset existing array && refresh upon leaving party
	function sLeaveParty() {
		party.length = 0;
		if (enabled) refresh()
	}

	function sLoadTopo(e) {
		myZone = e.zone
	}

	function sLogin(e) {
		myGameId = e.gameId
	}

	// credit : HugeDong69 for Guardian Legion mission crash fix
	function sFearmoveStage() {
		if (enabled) return false
	}

	function sFearmoveEnd() {
		if (enabled) return false
	}

	// pre-req to load in guild members
	function sGetUserList(e) {
		for (let character of e.characters)
			if (!guild.includes(character.guildName) && character.guildName !== '')
				guild.push(character.guildName)
	}

	// TODO
	// pre-req to load in party members
	// if new party refresh
	// for every member in the party, ignore self
	// then add new party members to the list
	function sPartyMemberList(e) {
		if (instance.includes(myZone)) return
		if (party.length == 0) refresh()
		for (let member of e.members)
			if (member.gameId.equals(myGameId)) continue
			else if (!party.includes(member.gameId.toString()))
				party.push(member.gameId.toString())
	}

	// TODO
	function sSpawnUser(e) {
		if (instance.includes(myZone)) return
		if (enabled) {
			if (enableParty) {
				if (!(guild.includes(e.guild) || party.includes(e.gameId.toString()))) return false
				else return
			}
			else return false
		}
	}

	// helper
	function refresh() {
		d.toServer('C_SET_VISIBLE_RANGE', 1, {
			range: 1
		})
		setTimeout(() => {
			d.toServer('C_SET_VISIBLE_RANGE', 1, {
				range: visibleRange
			})
		}, 1000)
	}

	function send(msg) {
		d.command.message(msg)
	}

}
