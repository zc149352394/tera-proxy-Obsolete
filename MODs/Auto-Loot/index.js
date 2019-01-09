String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function AutoLoot(d) {

	let enabled = config.enabled,
		notifications = config.notifications,
		auto = config.auto,
		lootDelay = config.lootDelay,
		loopInterval = config.loopInterval,
		black = config.black,
		blacklist = config.blacklist

	let location = {},
		loop = 0,
		loot = {},
		lootDelayTimeout = 0,
		mounted = false,
		myGameId = 0

	d.hook('S_LOAD_CLIENT_USER_SETTING', 1, sLoadClientUserSetting)
	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('C_PLAYER_LOCATION', 5, cPlaterLocation)
	d.hook('S_MOUNT_VEHICLE', 2, sMountVehicle)
	d.hook('S_UNMOUNT_VEHICLE', 2, sUnmountVehicle)
	d.hook('S_SPAWN_DROPITEM', 6, sSpawnDropitem)
	d.hook('S_DESPAWN_DROPITEM', 4, sDespawnDropitem)
	d.hook('S_SYSTEM_MESSAGE', 1, sSystemMessage)
	d.hook('C_TRY_LOOT_DROPITEM', 4, cTryLootDropitem)

	function sLoadClientUserSetting() {
		process.nextTick(() => {
			if (enabled) {
				status()
			}
		})
	}
	// code
	function sLogin(e) {
		myGameId = e.gameId
		setup()
	}

	function sLoadTopo() {
		loot = {}
		mounted = false
		if (enabled && notifications) {
			status()
		}
	}

	function cPlaterLocation(e) {
		location = e.loc
	}

	// mount condition
	function sMountVehicle(e) {
		if (e.gameId.equals(myGameId)) mounted = true
	}

	function sUnmountVehicle(e) {
		if (e.gameId.equals(myGameId)) mounted = false
	}

	// collect items in set
	function sSpawnDropitem(e) {
		if (black) {
			if (!(blacklist.includes(e.item))) {
				loot[e.gameId] = e
			}
		} else {
			loot[e.gameId] = e
		}
	}

	// remove despawned items in set
	function sDespawnDropitem(e) {
		if (e.gameId in loot) delete loot[e.gameId]
	}

	// K TERA : 'That isn't yours.' message
	function sSystemMessage(e) {
		if (e.message === '@41') return false
	}

	// for when auto is disabled, attempt to loot items nearby (ranged)
	function cTryLootDropitem() {
		lootAll()
	}

	// helper
	function lootAll() {
		if (!enabled || mounted) return

		for (let item in loot) {

			if (location) {
				if (Math.abs(loot[item].loc.x - location.x) < 120 && Math.abs(loot[item].loc.y - location.y) < 120) {
					d.toServer('C_TRY_LOOT_DROPITEM', 4, {
						gameId: loot[item].gameId
					})
					break
				}
			}

			
			// rudimentary way to delay looting nearby dropitems
			// could convert async function/await as alternative
			// lootDelayTimeout = setTimeout(() => {}, lootDelay)
		}
	}

	function setup() {
		clearInterval(loop)
		loop = 0;
		loop = auto ? setInterval(lootAll, loopInterval) : 0
	}

	function status() {
		send(`可用命令: [lt] [lt a] [lt b] [lt s]`,
			`连续拾取 : ${enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')}`,
			`自动拾取 : ${auto ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')}`,
			`拾取模式 : ${black ? '黑名单过滤'.clr('00FFFF') : '地上全部道具'.clr('FF0000')}`
		)
	}

	function send(msg) {
		d.command.message([...arguments].join('\n\t - '.clr('FFFFFF')))
	}

	// command
	d.command.add(['loot', 'lt'], (arg) => {
		// toggle
		if (!arg) {
			enabled = !enabled
			status()
		// auto
		} else if (arg === 'a' || arg === 'auto') {
			auto = !auto
			setup()
			send('自动拾取 ' + (auto ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
		} else if (arg === 'b' || arg === 'black') {
			black = !black
			send('拾取模式 ' + (black ? '黑名单过滤'.clr('56B4E9') : '地上全部道具'.clr('FF0000')))
		// status
		} else if (arg === 's' || arg === 'status') status()
		else send('无效的参数'.clr('FF0000'))
	})

}
