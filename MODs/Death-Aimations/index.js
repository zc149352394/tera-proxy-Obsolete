module.exports = function DeathAnimations(dispatch) {
	
	dispatch.hook("S_DESPAWN_NPC", 3, sDespawnNpc)

	function sDespawnNpc(event) {
		if (event.type !== 5) return
		event.type = 1
		return true
	}

}
