String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.json');
const potions = require('./potions.js');

module.exports = function LetMePot(d) {

	let enabled = config.enabled,
		AUTOHP = config.autoHP,						// true - Activates the auto-hp potion function / false - Deactivates
		AUTOMP = config.autoMP,						// true - Activates the auto-mp potion function / false - Deactivates
		NOTIFICATIONS = config.notifications;		// true - Activates notification when a potions is used / false - Deactivates

	let	oCid = null,
		oX = null,
		oY = null,
		oZ = null,
		oW = null,
		oInCombat = false,
		oHp = 100,
		oMana = 100,
		oAlive = false,
		getPotInfo = false;

	let hpPotList = potions.filter(function (p) { return p.hp == true; }),
		mpPotList = potions.filter(function (p) { return p.hp != true; });

	hpPotList.sort(function (a, b) { return parseFloat(a.use_at) - parseFloat(b.use_at); });
	mpPotList.sort(function (a, b) { return parseFloat(a.use_at) - parseFloat(b.use_at); });

	d.command.add('lmp', () => {
		enabled = !enabled;
		let txt = (enabled) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
		message('自动喝药水 ' + txt, true);
	});

	d.command.add('lmpmsg', () => {
		NOTIFICATIONS = !NOTIFICATIONS;
		let txt = (NOTIFICATIONS) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
        message('文字提示 ' + txt, true);
    });

	d.command.add('lmpinfo', () => {
		getPotInfo = true;
		message('使用1次您想要添加的[<font color="#56B4E9">药水</font>], 并在代理控制台中查看itemID'.clr('00FFFF'), true);
	});

	d.hook('S_LOGIN', 10, sLogin);
	d.hook('S_SPAWN_ME', 3, sSpawnMe);
	d.hook('C_PLAYER_LOCATION', 5, { order: -2 }, cPlayerLocation);
	d.hook('S_USER_STATUS', 2, sUserStatue);
	d.hook('S_INVEN', 16, { order: -2 }, sInven);
	d.hook('C_USE_ITEM', 3, { order: -2 }, cUserItem);
	d.hook('S_CREATURE_CHANGE_HP', 6, sCreatureChangeHp);
	d.hook('S_PLAYER_CHANGE_MP', 1, sPlayerChangeMp);

	function sLogin(event) {
		enabled = false;
		oCid = event.gameId;
		enabled = config.enabled;
	};

	function sSpawnMe(event) {
		oAlive = event.alive;
	};

	function cPlayerLocation(event) {
		oX = (event.loc.x + event.dest.x) / 2;
		oY = (event.loc.y + event.dest.y) / 2;
		oZ = (event.loc.z + event.dest.z) / 2;
		oW = event.w;
	};

	function sUserStatue(event) {
		if (event.gameId.equals(oCid)) {
			oInCombat = ((event.status == 1) ? true : false);
		}
	};

	function sInven(event) {
		if (!enabled) return; // Too much info, better just turn off if disabled

		let tempInv = event.items;
		for (i = 0; i < tempInv.length; i++) {
			for (o = 0; o < hpPotList.length; o++) {
				if (hpPotList[o].item == tempInv[i].id) {
					hpPotList[o].invQtd = tempInv[i].amount;
					hpPotList[o].id = tempInv[i].dbid;
				}
			}
			for (p = 0; p < mpPotList.length; p++) {
				if (mpPotList[p].item == tempInv[i].id) {
					mpPotList[p].invQtd = tempInv[i].amount;
					mpPotList[p].id = tempInv[i].dbid;
				}
			}
		}
	};

	function cUserItem(event) {
		if (getPotInfo == true && event.gameId.equals(oCid)) {
			message('药品信息: { item: ' + event.id + ' }');
			getPotInfo = false;
		}
	};

	function sCreatureChangeHp(event) {

		if (!enabled || !AUTOHP) return;

		if (event.target.equals(oCid)) {
			oHp = Math.round(event.curHp / event.maxHp * 100);
			if (event.curHp <= 0) oAlive = false;
			for (let i = 0; i < hpPotList.length; i++) {
				if (oHp <= hpPotList[i].use_at && hpPotList[i].inCd == false && hpPotList[i].invQtd > 0 && oInCombat == true && oAlive == true) {
					useItem(hpPotList[i]);
					hpPotList[i].inCd = true;
					hpPotList[i].invQtd--;
					setTimeout(function () { hpPotList[i].inCd = false; }, hpPotList[i].cd * 1000);
					if (NOTIFICATIONS) message('自动使用[<font color="#56B4E9">' + hpPotList[i].name + '</font>], 剩余<font color="#E69F00">' + hpPotList[i].invQtd + '</font>瓶', true);
					break;
				}
			}
		}

	};

	function sPlayerChangeMp(event) {

		if (!enabled || !AUTOMP) return;

		if (event.target.equals(oCid)) {
			oMana = Math.round(event.currentMp / event.maxMp * 100);
			for (let i = 0; i < mpPotList.length; i++) {
				if (oMana <= mpPotList[i].use_at && mpPotList[i].inCd == false && mpPotList[i].invQtd > 0 && oInCombat == true && oAlive == true) {
					useItem(mpPotList[i]);
					mpPotList[i].inCd = true;
					mpPotList[i].invQtd--;
					setTimeout(function () { mpPotList[i].inCd = false; }, mpPotList[i].cd * 1000);
					if (NOTIFICATIONS) message('自动使用[<font color="#56B4E9">' + mpPotList[i].name + '</font>], 剩余<font color="#E69F00">' + mpPotList[i].invQtd + '</font>瓶', true);
					break;
				}
			}
		}

	};

	function useItem(potInfo) {
		d.toServer('C_USE_ITEM', 3, {
			gameId: oCid,
			id: potInfo.item,
			dbid: potInfo.id,
			target: 0,
			amount: 1,
			dest: {x: 0, y: 0, z: 0},
			loc: {x: oX, y: oY, z: oZ},
			w: oW,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: 1
		});        
	}

	function message(msg, chat = false) {
		if (chat == true) {
			d.command.message(msg);
		} else {
			console.log('(Let Me Pot) ' + msg);
		}
	}

}
