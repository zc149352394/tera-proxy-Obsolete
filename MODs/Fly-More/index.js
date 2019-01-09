const CATEGORY_GLOBAL = 9999
const SKILL_FLYING_DISMOUNT = 65000001

module.exports = function FlyMore(d) {
	let gameId = -1n,
		location = null,
		outOfEnergy = false,
		dismountByUser = false,
		mountDisabled = false,
		inCombat = false,
		mountSkill = -1,
		serverMounted = false,
		remountTimer = null

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_CANT_FLY_ANYMORE', 1, sCantFlyAnymore)
	d.hook('S_PLAYER_CHANGE_FLIGHT_ENERGY', 1, sPlayerChangeFlightEnergy)
	d.hook('C_PLAYER_LOCATION', 5, cPlayerLocation)
	d.hook('C_PLAYER_FLYING_LOCATION', 4, cPlayerFlyingLocation)
	d.hook('S_SKILL_CATEGORY', 3, sSkillCategory)
	d.hook('S_USER_STATUS', 2, sUserStatus)
	d.hook('C_START_SKILL', 7, cStartSkill)
	d.hook('S_MOUNT_VEHICLE', 2, {order: 10}, sMountVehicle)
	d.hook('S_UNMOUNT_VEHICLE', 2, {order: 10}, sUnmountVehicle)

	function sLogin(event) {
		gameId = event.gameId
	}

	function sCantFlyAnymore() {
		return false
	}

	function sPlayerChangeFlightEnergy(event) {
		outOfEnergy = event.energy === 0
	}

	function cPlayerLocation(event) {
		location = {flying: false, pos: event.loc, dir: event.w}
	}

	function cPlayerFlyingLocation(event) {
		location = {flying: true, pos: event.loc, dir: event.w}
		if (outOfEnergy && event.type !== 7 && event.type !== 8) {
			event.type = 7
			return true
		}
	}

	function sSkillCategory(event) {
		if (event.category === CATEGORY_GLOBAL) {
			mountDisabled = !event.enabled
		}
	}
	
	function sUserStatus(event) {
		if(event.gameId === gameId) {
			inCombat = event.status === 1
		}
	}

	function cStartSkill(event) {
		if (event.skill.id === mountSkill || event.skill.id === SKILL_FLYING_DISMOUNT) {
			dismountByUser = true
			mountSkill = -1
		}
	}

	function sMountVehicle(event) {
		if (event.gameId === gameId) {
			const fakeMounted = mountSkill !== -1
			serverMounted = true
			mountSkill = event.skill
			if (fakeMounted) {
				return false
			}
		}
	}

	function sUnmountVehicle(event) {
		if (event.gameId !== gameId) {
			return
		}
		serverMounted = false
		if (!location.flying || dismountByUser) {
			dismountByUser = false
			mountSkill = -1
		} else {
			clearTimeout(remountTimer)
			remountTimer = setTimeout(tryRemount, 50)
			return false
		}
	}

	function tryRemount() {
		if (!mountDisabled && !inCombat) {
			d.send('C_START_SKILL', 7, {
				skill: mountSkill,
				w: location.dir,
				loc: location.pos,
				unk: true
			})
			remountTimer = setTimeout(() => {
				if (!serverMounted) {
					d.send('S_UNMOUNT_VEHICLE', 2, {gameId, skill: mountSkill})
					mountSkill = -1
				}
			}, 1000)
		} else {
			d.send('S_UNMOUNT_VEHICLE', 2, {gameId, skill: mountSkill})
			mountSkill = -1
		}
	}

}
