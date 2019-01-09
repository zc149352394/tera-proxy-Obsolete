module.exports = function AFKer(d) {

	let afk = false,
		afkCheck = null

	d.hook('C_PLAYER_LOCATION', 5, cPlayerLocation)
	d.hook('C_RETURN_TO_LOBBY', 1, cRetuenToLobby)

	function cPlayerLocation() {
		clearTimeout(afkCheck)
		afk = false
		afkCheck = setTimeout(() => { afk = true }, 3600000)
	}

	function cRetuenToLobby() {
		if (afk) {
			return false
		}
	}

}
