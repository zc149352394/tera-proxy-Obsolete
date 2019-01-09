String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.json');

const mapID = [9720, 9920];						// MAP ID to input [ Normal Mode , Hard Mode ]

const ThirdBossActions = {						// Third Boss Attack Actions
	113: {msg: '前砸+后砸 ↓', msg_tk: '前砸+后砸 ↓'},
	111: {msg: '右侧安全 →→', msg_tk: '← ←← ←←←', sign_degrees: 90, sign_distance: 190},
	109: {msg: '←← 左侧安全', msg_tk: '→→→ →→ →', sign_degrees: 270, sign_distance: 110}
};

const ThirdBossTwoUp = {
	104: {msg: '后砸 ↓', msg_tk: '后砸 ↓'}
};

module.exports = function AAGuide(d) {

	let hooks = [], bossCurLocation, bossCurAngle, uid = 999999999, uid2 = 899999999;

	let	enabled = config.enabled,
		itemhelper = config.itemhelper,
		sendToParty = config.sendToParty,
		streamenabled = config.streamenabled,
		isTank = config.isTank,
		insidemap = false;

////Commands:
	d.command.add('aag', (arg) => {
		if (!insidemap) {
			d.command.message('你必须进入 [深渊] 副本!'.clr('FF0000'));
			return;
		}
		if (!arg) {
			enabled = !enabled;
			d.command.message('辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "party":
					sendToParty = !sendToParty;
					d.command.message('发送通知 ' + (sendToParty ? '组队'.clr('56B4E9') : '自己'.clr('E69F00')));
					break;
				case "proxy":
					streamenabled = !streamenabled;
					d.command.message('代理频道 ' + (streamenabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "help":
					itemhelper = !itemhelper;
					d.command.message('安全点标志 ' + (itemhelper ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "tank":
					isTank = !isTank;
					d.command.message('坦克视角提示 ' + (isTank ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				default :
					d.command.message('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)

////Functions
	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {
			isTank = true;
		} else {
			isTank = false;
		}
	}

	function sLoadTopo(event) {
		if (event.zone === mapID[0]) {								
			insidemap = true;
			d.command.message('进入副本: ' + '安塔洛斯的深渊 '.clr('56B4E9') + '[下级]'.clr('E69F00'));
			load();
			if (isTank) {
				for (let prop in ThirdBossActions) {
					ThirdBossActions[prop].msg = ThirdBossActions[prop].msg_tk;
				}
			}
		} else if (event.zone === mapID[1]) {
			insidemap = true;
			d.command.message('进入副本: ' + '安塔洛斯的深渊 '.clr('56B4E9') + '[上级]'.clr('00FFFF'));
			load();
			if (isTank) {
				for (let prop in ThirdBossActions) {
					ThirdBossActions[prop].msg = ThirdBossActions[prop].msg_tk;
				}
			}
		} else {
			insidemap = false;
			unload();
		}
    }

	function sendMessage(msg) {
		if (sendToParty) {
			d.toServer('C_CHAT', 1, {
				channel: 21, //21 = p-notice, 1 = party, 2 = guild
				message: msg
			});
		} else if (streamenabled) {
			d.command.message(msg);
		} else {
			d.toClient('S_CHAT', 2, {
				channel: 21, //21 = p-notice, 1 = party
				authorName: 'DG-Guide',
				message: msg
			});
		}
	}

	function SpawnThing(degrees, radius) {
		let r = null, rads = null, finalrad = null, pos = null;

		r = bossCurAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		bossCurLocation.x = bossCurLocation.x + radius * Math.cos(finalrad);
		bossCurLocation.y = bossCurLocation.y + radius * Math.sin(finalrad);

		d.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid,
			itemId : 1,
			loc : bossCurLocation,
			w : r,
			unk : 0,
			ownerName : '安全',
			message : '安全区'
		});

		setTimeout(DespawnThing, 5000, uid, uid2);
		uid--;

		bossCurLocation.z = bossCurLocation.z - 100;

		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			loc: bossCurLocation,
			item: 98260,
			amount: 1,
			expiry: 6000,
			owners: [{playerId: uid2}]
		});
		uid2++;
	}

	function DespawnThing(uid_arg, uid_arg2) {
		d.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg,
			unk : 0
		});
		d.toClient('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}

	let lasttwoup = 0, rotationdelaylast = 0, rotationdelay = 0, bossid = 0;

	function load() {
		if (!hooks.length) {
			hook('S_CREATURE_ROTATE', 2, sCreatureRotate)
			hook('S_ACTION_STAGE', 8, sActionStage)

			function sCreatureRotate(event) {
				if (!lasttwoup || !bossid.equals(event.gameId)) return;
				rotationdelaylast = Date.now();
				rotationdelay = event.time;
			}

			function sActionStage(event) {
				if (!enabled || event.templateId !== 3000) return;
				if (ThirdBossTwoUp[event.skill.id % 1000]) {
					let now = Date.now();
					// ~890
					if (now - rotationdelaylast > 1200) {
						rotationdelay = 0;
					}
					if (now - lasttwoup - rotationdelay < 2900) {
						sendMessage(ThirdBossTwoUp[event.skill.id % 1000].msg /*+ " : " + String(now - lasttwoup) + " - " + String(rotationdelay) + " = " + String(now - lasttwoup - rotationdelay)*/ );
					}
					lasttwoup = now;
					bossid = event.gameId;
				} else {
					lasttwoup = 0;
					rotationdelaylast = 0;
					if (ThirdBossActions[event.skill.id % 1000]) {
						sendMessage(ThirdBossActions[event.skill.id % 1000].msg);
						if (itemhelper && typeof ThirdBossActions[event.skill.id % 1000].sign_degrees !== "undefined") {
							bossCurLocation = event.loc;
							bossCurAngle = event.w;
							SpawnThing(ThirdBossActions[event.skill.id % 1000].sign_degrees, ThirdBossActions[event.skill.id % 1000].sign_distance)
						}
					}
				}
			}
		}
	}

	function unload() {
		if (hooks.length) {
			for(let h of hooks) d.unhook(h)
			hooks = []
		}
	}

	function hook() {
		hooks.push(d.hook(...arguments))
	}

}
