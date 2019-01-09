String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.json');
const skills = require('./skills');

module.exports = function LetMeDrink(d) {

	let enabled = config.enabled,
		LAIN_ID = config.lain_ID,							// Lein's Dark Root Beer ID
		DELAY = config.delay,								// How much time in miliseconds should wait after buff (seconds * 1000)
		NOTIFICATIONS = config.notifications;				// true - Activates notification when you drink / false - Deactivates

	let oCid = null,
		oJob = null,
		oX = null,
		oY = null,
		oZ = null,
		oW = null,
		qtdDrink = 0,
		idDrink = null,
		isCdDrink = false,
		getInfoCommand = false;

	d.command.add('lmd', () => {
		enabled = !enabled;
		let txt = (enabled) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
        message('自动喝啤酒 ' + txt, true);
    });
	
	d.command.add('lmdmsg', () => {
		NOTIFICATIONS = !NOTIFICATIONS;
		let txt = (NOTIFICATIONS) ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00');
        message('文字提示 ' + txt, true);
    });

	d.command.add('lmdinfo', () => {
		getInfoCommand = true;
		message('使用1次您想要绑定的[<font color="#56B4E9">技能</font>], 并在代理控制台中查看ID'.clr('00FFFF'), true);
	});

	d.hook('S_LOGIN', 10, sLogin);
	d.hook('C_PLAYER_LOCATION', 5, { order: -2 }, cPlayerLocation);
	d.hook('S_INVEN', 16, { order: -2 }, sInven);
	d.hook('S_START_COOLTIME_ITEM', 1, sStartCooltimeItem);
	d.hook('C_START_SKILL', 7, { order: -2 }, cStartSkill);

	function sLogin(event) {
		enabled = false;
		oCid = event.gameId;
		oJob = (event.templateId - 10101) % 100;
		enabled = config.enabled;
//		enabled = ([0, 1, 3, 4, 5, 8, 12].includes(oJob) ? true : false;
    };

	function cPlayerLocation(event) {
		oX = (event.loc.x + event.dest.x) / 2;
		oY = (event.loc.y + event.dest.y) / 2;
		oZ = (event.loc.z + event.dest.z) / 2;
		oW = event.w;
	};

	function sInven(event) {
		if (!enabled) return;

		let tempInv = event.items;
		for (i = 0; i < tempInv.length; i++) {
			if (tempInv[i].id == LAIN_ID) {
				qtdDrink = tempInv[i].amount;
				idDrink = tempInv[i].dbid;
				break;
			}
		}
	};

	function sStartCooltimeItem(event) {
		if (event.item == LAIN_ID && isCdDrink == false) {
			isCdDrink = true;
			setTimeout(function () { isCdDrink = false; }, event.cooldown * 1000);
		}
	};

	function cStartSkill(event) {
		if (!enabled) return;

		let sInfo = getSkillInfo(event.skill.id);

		if (getInfoCommand) {
			message('技能信息: { group: ' + sInfo.group + ' / job: ' + oJob + ' }');
			getInfoCommand = false;
		}

		for (s = 0; s < skills.length; s++) {
			if (skills[s].group == sInfo.group && skills[s].job == oJob && isCdDrink == false && qtdDrink > 0) {
				useItem();
				break;
			}
		}
	};

	function useItem() {
		setTimeout(function () {
			d.toServer('C_USE_ITEM', 3, {
				gameId: oCid,
				id: LAIN_ID,
				dbid: idDrink,
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
			isCdDrink = true;
			qtdDrink--;
			if (NOTIFICATIONS) message('自动使用[<font color="#56B4E9">莱纳式黑啤酒</font>], 剩余<font color="#E69F00">' + qtdDrink + '</font>瓶', true);
			setTimeout(function () { isCdDrink = false; }, 60000);
		}, DELAY);
    }

    function getSkillInfo(id) {
		let nid = id;	// -= 0x4000000;
		return {
			id: nid,
			group: Math.floor(nid / 10000),
			level: Math.floor(nid / 100) % 100,
			sub: nid % 100
		};
	}

	function message(msg, chat = false) {
		if (chat == true) {
			d.command.message(msg);
		} else {
			console.log('(Let Me Drink) ' + msg);
		}
	}

}
