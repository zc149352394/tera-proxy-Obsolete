String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const Vec3 = require('tera-vec3')
// const request = require('request')
const config = require('./config.json')
const bosses = require('./bosses.json')

module.exports = function WorldBoss(d) {

	let enabled = config.enabled,
		alerted = config.alerted,
		messager = config.messager,
		marker = config.marker,
		itemId = config.itemId,
		discord = config.discordWebhookUrl,
		mention = config.mention

	let playerName,
		currentZone,
		bossName,
		mobid = []

	d.command.add('wbh', (arg1, arg2) => {
		switch (arg1) {
			case 'alert':
				alerted = !alerted
				d.command.message('通知: [' + (alerted ? green('开启') : red('关闭'))  + ']')
				break

			case 'msg':
				messager = !messager
				d.command.message('记录: [' + (messager ? green('开启') : red('关闭'))  + ']')
				break

			case 'mark':
				marker = !marker
				d.command.message('标记: [' + (marker ? green('开启') : red('关闭'))  + ']')
				break

			case 'clear':
				d.command.message('清除标记')
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
				break

			case 'ui':
				d.send('S_OPEN_AWESOMIUM_WEB_URL', 1, {
					url: 'tera.zone/worldboss/ingame.php?serverId=' + serverId
				})
				break

			default:
				enabled = !enabled
				d.command.message('模块: [' + (enabled ? green('开启') : red('关闭'))  + ']')
				if (!enabled) {
					for (let itemId of mobid) {
						despawnItem(itemId)
					}
				}
		}
	})

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('S_CURRENT_CHANNEL', 2, sCurrentChannel)
	d.hook('S_SPAWN_NPC', 9, sSpawnNpc)
	d.hook('S_DESPAWN_NPC', 3, {order: -100}, sDespawnNpc)

	function sLogin(event) {
		serverId = event.serverId
		if (discord) {
			playerName = event.name
		} else {
			playerName = "Anonymous"
		}
	}

	function sLoadTopo(event) {
		currentZone = event.zone
		mobid = []
	}

	function sCurrentChannel(event) {
		currentChannel = event.channel
	}

	function sSpawnNpc(event) {
		let boss
		if (enabled && (boss = bosses.filter(b => b.huntingZoneId.includes(event.huntingZoneId) && b.templateId === event.templateId)[0])) {
			bossName = boss.name
			if (marker) {
				spawnItem(event.loc, event.gameId.low)
				mobid.push(event.gameId.low)
			}
			/* request.post('https://tera.zone/worldboss/upload.php', {
				form: {
					serverId: serverId,
					playerName: playerName,
					bossName: bossName,
					channel: currentChannel,
					time: new Date().getTime(),
					status: 'found',
					discord: encodeURIComponent(discord),
					mention: mention
				}
			}, function(err, httpResponse, body) {
				if (err) {
					console.log(err)
				} else {
					console.log('[World-Boss] ' + body)
				}
			}) */
			if (alerted) {
				notice('发现BOSS: ' + bossName + '!')
			}
			if (messager) {
				d.command.message('发现BOSS: ' + `${bossName}`.clr('56B4E9') + '!')
			}
		}
	}

	function sDespawnNpc(event) {
		if (mobid.includes(event.gameId.low)) {
			if (alerted && bossName) {
				if (event.type == 5) {
					/* request.post('https://tera.zone/worldboss/upload.php', {
					form: {
						serverId: serverId,
						playerName: playerName,
						bossName: bossName,
						channel: currentChannel,
						time: new Date().getTime(),
						status: 'killed',
						discord: encodeURIComponent(discord)
					}
					}, function(err, httpResponse, body) {
						if (err) {
							console.log(err)
						} else {
							console.log('[World-Boss] ' + body)
						}
					}) */
					if (alerted) {
						notice(bossName + ' 被击杀')
					}
					if (messager) {
						d.command.message(bossName + ' 被击杀')
					}
				} else if (event.type == 1) {
					if (alerted) {
						notice(bossName + ' 超出范围...')
					}
					if (messager) {
						d.command.message(bossName + ' 超出范围...')
					}
				}
			}
			bossName = null
			despawnItem(event.gameId.low)
			mobid.splice(mobid.indexOf(event.gameId.low), 1)
		}
	}

	function spawnItem(loc, gameId) {
		d.send('S_SPAWN_DROPITEM', 6, {
			gameId: {
			low: gameId,
			high: 0,
			unsigned: true
			},
			loc: loc,
			item: itemId,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		})
	}

	function despawnItem(gameId) {
		d.send('S_DESPAWN_DROPITEM', 4, {
			gameId: {
				low: gameId,
				high: 0,
				unsigned: true
			}
		})
	}

	function notice(msg) {
		d.send('S_DUNGEON_EVENT_MESSAGE', 2, {
			type: 42,
			chat: 0,
			channel: 0,
			message: msg
		})
	}

	function green(greentext) {
		return '<font color="#00FFFF">' + greentext + '</font>'
	}

	function red(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}

	this.destructor = function() {
		d.command.remove('wbh')
	}

}
