String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.json');
const skills = require('./skills');

module.exports = function LetMeTarget(d) {

	let ownId = null,
		cid = null,
		model = null,
		job = null,
		ownX = null,
		ownY = null,
		ownZ = null,
		ownAlive = false,
		locking = false,
		partyMembers = [],
		bossInfo = [];

	let enabled = config.enabled,

		lockDelay = config.delay_lockon.on,
		lockmin = config.delay_lockon.min,
		lockmax = config.delay_lockon.max,

		smartC = config.cleanse.smartC,

		autoDps = config.dps.auto,
		autoDpsDelay = config.dps.delay;

	d.command.add('lmt', () => {
		enabled = !enabled;
		let txt = (enabled) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
		message('智能锁定 ' + txt, true);
	});

	d.command.add('lmtlock', () => {
		lockDelay = !lockDelay;
		let txt = (lockDelay) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
		message('智能治疗技能 ' + txt, true);
	});

	d.command.add('lmtsmart', () => {
		smartC = !smartC;
		let txt = (smartC) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
		message('智能消解异常 ' + txt, true);
	});

	d.command.add('lmtboss', (arg) => {
		if (arg!=null) {
			arg = parseInt(arg);
			autoDpsDelay = arg;
			message('智能锁定王设定延迟 ' + arg, true);
		} else {
			autoDps = !autoDps;
			let txt = (autoDps) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
			message('智能锁定王 ' + txt, true);
		}
	});

    d.command.add('l1', () => {
        sortDistBoss();
        message(JSON.stringify(bossInfo, null, 4));
    });

    d.command.add('l2', () => {
        sortHp();
        message(JSON.stringify(partyMembers, null, 4));
    });

	d.hook('S_LOGIN', 10, sLogin);
	d.hook('S_SPAWN_ME', 3, sSpawnMe);
	d.hook('S_PARTY_MEMBER_LIST', 7, sPartyMemberList);
	d.hook('S_LEAVE_PARTY', 1, sLeaveParty);
	d.hook('S_LEAVE_PARTY_MEMBER', 2, sLeavePartyMember);
	d.hook('S_PARTY_MEMBER_CHANGE_HP', 4, sPartyMemberChangeHp);
	d.hook('S_LOGOUT_PARTY_MEMBER', 1, sLogoutPartyMember);
	d.hook('S_USER_LOCATION', 5, { order: -2 }, sUserLocation);
	d.hook('C_PLAYER_LOCATION', 5, { order: -2 }, cPlayerLocation);
	d.hook('S_ABNORMALITY_BEGIN', 3, { order: -2 }, sAbnormalityBegin);
	d.hook('S_ABNORMALITY_END', 1, { order: -2 }, sAbnormalityEnd);
	d.hook('S_BOSS_GAGE_INFO', 3, { order: -2 }, sBossGageInfo);
	d.hook('S_ACTION_STAGE', 8, { order: -2 }, sActionStage);
	d.hook('C_START_SKILL', 7, { order: -2 }, cStartSkill);
	d.hook('C_CANCEL_SKILL', 3, { order: -2 }, cCancelSkill);

	function sLogin(event) {
		ownId = event.playerId;
		cid = event.gameId;
		model = event.templateId;
		job = (model - 10101) % 100;
	}

	function sSpawnMe (event) {
		ownAlive = event.alive
	}

	function sPartyMemberList(event) {
		partyMembers = [];
		for (let party of event.members) {
			if (party.playerId != ownId) {
				partyMembers.push({
					playerId: party.playerId,
					cid: party.gameId,
					online: party.online,
					hpP: party.online ? 1 : 0,
					curHp: 0,
					debuff: false,
					debId: [],
					x: null,
					y: null,
					z: null,
					name: party.name
				});
			}
		}
	}

	function sLeaveParty(event) {
		partyMembers = [];
		bossInfo = [];
		locking = false;
	}

	function sLeavePartyMember(event) {
		partyMembers = partyMembers.filter(
			function (p) {
				return p.playerId != event.playerId;
			}
		);
	}

	function sPartyMemberChangeHp(event) {
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId == event.playerId) {
				partyMembers[i].hpP = (event.currentHp / event.maxHp);
				partyMembers[i].curHp = event.currentHp;
				break;
			}
		}
	}

	function sLogoutPartyMember(event) {
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId == event.playerId) {
				partyMembers[i].online = false;
				break;
			}
		}
	}

	function sUserLocation(event) {
		if (partyMembers != null) {
			for (let i = 0; i < partyMembers.length; i++) {
				if (partyMembers[i].cid.equals(event.gameId)) {
					partyMembers[i].x = (event.loc.x + event.dest.x) / 2;
					partyMembers[i].y = (event.loc.y + event.dest.y) / 2;
					partyMembers[i].z = (event.loc.z + event.dest.z) / 2;
					break;
				}
			}
		}
	}

	function cPlayerLocation(event) {
		ownX = (event.loc.x + event.dest.x) / 2;
		ownY = (event.loc.y + event.dest.y) / 2;
		ownZ = (event.loc.z + event.dest.z) / 2;
	}

	function sAbnormalityBegin(event) {
		if (event.source.low == 0 || event.source.high == 0 || event.target.equals(event.source) || partyMembers == null || event.source.equals(cid)) return;

		for (let y = 0; y < partyMembers.length; y++) {
			if (partyMembers[y].cid.equals(event.source)) return;
		}

		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].cid.equals(event.target)) {
				partyMembers[i].debuff = true;
				partyMembers[i].debId.push(event.id);
				break;
			}
		}
	}

	function sAbnormalityEnd(event) {
		if (partyMembers == null) return

		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].cid.equals(event.target)) {
				let newDebId = [];

				for (let x = 0; x < partyMembers[i].debId.length; x++) {
					if (partyMembers[i].debId[x] != event.id) newDebId.push(event.id);
				}
				partyMembers[i].debId = newDebId;

				if (newDebId.length <= 0) partyMembers[i].debuff = false;
				break;
			}
		}
	}

	function sBossGageInfo(event) {
		let alreadyHaveBoss = false;
		let tempPushEvent = {
			id: event.id,
			x: 99999999,
			y: 99999999,
			z: 99999999,
			w: null,
			hp: (event.curHp / event.maxHp),
			dist: 100
		}
		if (bossInfo.length <= 0) {
			bossInfo.push(tempPushEvent);
		} else {
			for (let b = 0; b < bossInfo.length; b++) {
				if (bossInfo[b].id.equals(event.id)) {
					bossInfo[b].hp = (event.curHp / event.maxHp);
					alreadyHaveBoss = true;
					if (event.curHp <= 0) {
						bossInfo = bossInfo.filter(function (p) {
							return !p.id.equals(event.id);
						});
					}
					break;
				}
			}
			if (alreadyHaveBoss == false) {
				bossInfo.push(tempPushEvent);
			}
		}
	}

	function sActionStage(event) {
		if (bossInfo.length <= 0) return;

		for (let b = 0; b < bossInfo.length; b++) {
			if (event.gameId.equals(bossInfo[b].id)) {
				bossInfo[b].x = event.loc.x;
				bossInfo[b].y = event.loc.y;
				bossInfo[b].z = event.loc.z;
				bossInfo[b].w = event.w;
				bossInfo[b].dist = checkDistance(ownX, ownY, ownZ, event.loc.x, event.loc.y, event.loc.z);
				break;
			}
		}
	}

	function cStartSkill(event) {
		//message(event.skill);
		if (!enabled) return;

		let skillInfo = getSkillInfo(event.skill.id);
		let packetSkillInfo = skills.find(o => o.group == skillInfo.group && o.job == job);
		if (packetSkillInfo && skillInfo.sub == 10) {
			locking = false;
			if (packetSkillInfo.type == 'cleanse' && partyMembers != null) {
				for (let i = 0; i < partyMembers.length; i++) {
					partyMembers[i].debuff = false;
					partyMembers[i].debId = [];
				}
			}
		}

		if (packetSkillInfo && partyMembers != null) {
			if (packetSkillInfo.type == 'heal' && partyMembers.length > 0) {
				sortHp();
				let qtdTarget = 0;
				locking = true;
				for (let i = 0; i < partyMembers.length; i++) {
					let distance = checkDistance(ownX, ownY, ownZ, partyMembers[i].x, partyMembers[i].y, partyMembers[i].z);
					if (partyMembers[i].curHp > 0 && partyMembers[i].hpP < 1 && distance <= packetSkillInfo.dist && qtdTarget <= packetSkillInfo.targets) {
						let newEvent = {
							target: partyMembers[i].cid,
							unk: 0,
							skill: event.skill
						}
						doTimeOutLock(newEvent);
						qtdTarget++;
					}
				}
			} else if (packetSkillInfo.type == 'cleanse' && partyMembers.length > 0) {
				let qtdTarget = 0;
				locking = true;
				for (let i = 0; i < partyMembers.length; i++) {
					let distance = checkDistance(ownX, ownY, ownZ, partyMembers[i].x, partyMembers[i].y, partyMembers[i].z);
					if (partyMembers[i].curHp > 0 && partyMembers[i].hpP <= 1 && distance <= packetSkillInfo.dist && qtdTarget <= packetSkillInfo.targets) {
						let newEvent = {
							target: partyMembers[i].cid,
							unk: 0,
							skill: event.skill
						}
						if (smartC == true && partyMembers[i].debuff == true) {
							doTimeOutLock(newEvent);
						}
						if (smartC == false) {
							doTimeOutLock(newEvent);
						}
						qtdTarget++;
					}
				}
			} else if ((packetSkillInfo.type == 'dps' || packetSkillInfo.type == 'buff' || packetSkillInfo.type == 'debuff') && bossInfo != null) {
				sortDistBoss();
				locking = true;
				if (bossInfo.length > 0 && bossInfo[0].dist <= packetSkillInfo.dist) {
					let newEvent = {
						target: bossInfo[0].id,
						unk: 0,
						skill: event.skill
					}
					doTimeOutLock(newEvent);
					if (autoDps) {
						doSkillActivation(event);
					}
				}
			}
		}
	}

	function cCancelSkill(event) {
		let skillInfo = getSkillInfo(event.skill.id);
		let packetSkillInfo = skills.find(o => o.group == skillInfo.group && o.job == job);
		if (packetSkillInfo && partyMembers != null) {
			locking = false;
		}
	}

	function getSkillInfo(id) {
		// Thanks SP2
		let nid = id;// -= 0x4000000;
		return {
			id: nid,
			group: Math.floor(nid / 10000),
			level: Math.floor(nid / 100) % 100,
			sub: nid % 100
		};
	}

	function doSkillActivation(event) {
		event.skill.id = (event.skill.id + 10);
		setTimeout(function () {
			d.toServer('C_START_SKILL', 7, event);
			locking = false;
		}, autoDpsDelay);
    }

	function doTimeOutLock(event) {
		setTimeout(function () {
			if (locking == true) {
				d.toServer('C_CAN_LOCKON_TARGET', 3, event);
				setTimeout(function () {
					d.toClient('S_CAN_LOCKON_TARGET', 3, Object.assign({ success: true }, event));
				}, 50);
			}
		}, lockDelay ? dRandom() : 20);
	}

	function sortHp() {
		partyMembers.sort(function (a, b) {
			return parseFloat(a.hpP) - parseFloat(b.hpP);
		});
	}

	function sortDistBoss() {
		bossInfo.sort(function (a, b) {
			return parseFloat(a.dist) - parseFloat(b.dist);
		});
	}

	function checkDistance(x, y, z, x1, y1, z1) {
		return (Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2) + Math.pow(z1 - z, 2))) / 25;
	}

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	function message(msg, chat = false) {
		if (chat == true) {
			d.command.message(msg);
		} else {
			console.log('(Let Me Target) ' + msg);
		}
	}

	function dRandom() {
		return Math.floor(Math.random() * (lockmax - lockmin)) + lockmin;
	}

}
