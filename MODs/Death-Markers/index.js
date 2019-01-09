String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

/*
	warrior = 0, lancer = 1, slayer = 2, berserker = 3,
	sorcerer = 4, archer = 5, priest = 6, mystic = 7,
	reaper = 8, gunner = 9, brawler = 10, ninja = 11, valkyrie = 12

	369		钻石

	55658	巴哈勒的遗物
	57000	赛莲的遗物

	91113	依斯莲的遗物
	91114	艾利奴的遗物
	91115	铁达时的遗物
	91116	亚玛伦的遗物
	91117	茱拉斯的遗物
	91118	基德的遗物
	91119	卡拉斯的遗物

	91166	达坤的宝物
	91177	依莎拉的遗物
	91188	奥林的遗物

	98260	古龙贝勒古斯的头
	98261	古龙贝勒古斯的牙齿
	98262	古龙贝勒古斯的鳞片
	98263	古龙贝勒古斯的角碎片
	98264	古龙贝勒古斯的骨头碎片

	98590	最后的元素

	98599	恶魔的脚爪
	98600	龙的骨头

	98654	龙族弓身
	98655	重量锤
 */
const JobSpecificMarkers = [
	{	// tanks
		jobs: [1, 10], 
		marker: 91177
	},
	{	// healers
		jobs: [6, 7], 
		marker: 91113
	}
];

module.exports = function PartyDeathMarkers(d) {

	let enabled = config.enabled,
		DefaultItemSpawn = config.DefaultItemSpawn,
		UseJobSpecificMarkers = config.UseJobSpecificMarkers;
	
	let playerId = 0;
	let partyMembers = [];
	let spawnedBeacons = [];

	d.command.add('dm', () => {
		enabled = !enabled;
		if (!enabled) removeAllMarkers();
		d.command.message('队友尸体标记 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
	});

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_PARTY_MEMBER_LIST', 7, sPartyMemberList)
	d.hook('S_DEAD_LOCATION', 2, sDeadLocation)
	d.hook('S_SPAWN_USER', 13, sSpawnUser)
	d.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, sPartyMemberStatUpdate)
	d.hook('S_LEAVE_PARTY_MEMBER', 2, sLeavePartyMember)
	d.hook('S_LEAVE_PARTY', 1, sLeaveParty)

	function sLogin(event) {
		playerId = event.playerId;
		removeAllMarkers();
	}

	function sPartyMemberList(event) {
		partyMembers = event.members;
	}

	function sDeadLocation(event) {
		for (let i = 0; i < partyMembers.length; i++) { 
			if (partyMembers[i].gameId.equals(event.gameId)) {
				spawnMarker(partyMembers[i].playerId, event.loc);
				return;
			}
		}
	}

	function sSpawnUser(event) {
		if (!event.alive) {
			for (let i = 0; i < partyMembers.length; i++) { 
				if (partyMembers[i].gameId.equals(event.gameId)) {
					spawnMarker(partyMembers[i].playerId, event.loc);
					return;
				}
			}
		}
	}

	function sPartyMemberStatUpdate(event) {
		if (playerId == event.playerId) return;
		if (event.curHp > 0) {
			for (let i = 0; i < partyMembers.length; i++) { 
				if (partyMembers[i].playerId == event.playerId) {
					removeMarker(event.playerId);
					return;
				}
			}
		}
	}

	function sLeavePartyMember(event) {
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId == event.playerId) {
				removeMarker(partyMembers[i].gameId);
			}
		}
	}

	function sLeaveParty(event) {
		removeAllMarkers();
		partyMembers = [];
	}

	function spawnMarker(id, loc) {
		let playerLoc = loc;

		if (!enabled) return;
		if (playerId == id) return;

		removeMarker(id); //refresh
		spawnedBeacons.push(id);
		
		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: id,
			loc: playerLoc,
			item: getSpawnItem(id),
			amount: 1,
			expiry: 999999,
			owners: [{
				id: 0
			}]
		});
	}

	function removeMarker(id) {
		if (spawnedBeacons.includes(id)) {
			let index = spawnedBeacons.indexOf(id);
			spawnedBeacons.splice(index, 1);
			d.toClient('S_DESPAWN_DROPITEM', 4, {
				gameId: id
			});
		}
	}

	function removeAllMarkers() {
		for (let i = 0; i < spawnedBeacons.length; i++) { 
			removeMarker(spawnedBeacons[i]);
		}
		spawnedBeacons = [];
	}

	function getSpawnItem(id) {
		if (UseJobSpecificMarkers) {
			let jobId;
			for (let i = 0; i < partyMembers.length; i++) { 
				if (partyMembers[i].playerId == id) {
					jobId = partyMembers[i].class;
				}
			}

			for (let i = 0; i < JobSpecificMarkers.length; i++) { 
				if (JobSpecificMarkers[i].jobs.includes(jobId)) {
					return JobSpecificMarkers[i].marker;
				}
			}
		}

		return DefaultItemSpawn;
	}

}
