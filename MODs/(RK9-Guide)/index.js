String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.json');

const MsgID = ['X', '近', '远', '全'];
const ModeID = [' [普通RK-9机库]', ' [终极RK-9机库]'];

const JUMP = '跳跳跳!';
const NOTOCE = '预计 10s 后出盾';

/* SCRIPT BY SHINO */
/* Usable Sysbols ◎●←↑→↓↖↗↘↙ */

const Vec3 = require('tera-vec3');
const mapID = [9735, 9935];						// MAP ID to input [ Normal Mode , Hard Mode ]
const HuntingZn = [735, 935]; 					// Add in your own Hunting Zone [ Normal Mode , Hard Mode ] 
const BossID = [1000, 2000, 3000]; 				// Add in Boss Template ID [ 1st boss , 2nd Boss, 3rd Boss ]
												// Leave value at 0 if you do not require Hardmode/1st Boss/2nd Boss
												// Ex. [735, 0] [0, 0, 3000];

const FirstBossActions = {						// First Boss Attack Actions Input here with desired call out Messages
	1189020954: {msg: '炸弹!!'},				// Actions placed here are universal and will be called out disregard to your class or job

	// 1189020760: {msg: '(后)重锤-1'},
	// 1189021759: {msg: '(后)重锤-2'},
	// 1189021760: {msg: '(前+后)重锤-3'},
	// 1189020759: {msg: '(前+后)重锤-4'},

	1189020957: {msg: '全屏鉴定'},
	1189020955: {msg: '群体拉人'}
};

const FirstBossActionsTank = {					// First Boss Actions call out for TANKS
	1189020752: {msg: '(晕)前夹'},			// Actions will only be called out if you have TANK MODE Enabled
	1189021752: {msg: '(晕)前夹'}
};

const SecondBossActions = {						// Second Boss Attack Actions
	1189020952: {msg: '(秒杀)爆炸'}
};

const SecondBossActionsTank = {					// Second Boss Actions for TANKS
/* 	1189020750: {msg: '(流血)前劈-1'},
	1189021750: {msg: '(流血)前劈-2'} */
};

const ThirdBossActions = {						// Third Boss Attack Actions
	1189020764: {msg: '右 →↘'},
	1189021764: {msg: '右 →↘'},
	1189020767: {msg: '右 →↘'},
	1189021767: {msg: '右 →↘'},

	1189020765: {msg: '左 ←↙'},
	1189021765: {msg: '左 ←↙'},
	1189020766: {msg: '左 ←↙'},
	1189021766: {msg: '左 ←↙'},

//	1189020969: {msg: '破盾!!'},
	1189020972: {msg: '内圈晕人'}
};

const ThirdBossActionsTank = {					// Third Boss Actions for TANKS

};

//FOR HARD MODE INPUT BELOW HERE//

const FirstBossActionsHM = {
	1202128154: {msg: '炸弹!!'},

	1202127960: {msg: '(后)重锤'},
	1202128960: {msg: '(后)重锤'},
	1202127959: {msg: '(前+后)重锤'},
	1202128959: {msg: '(前+后)重锤'},

	1202128157: {msg: '全屏鉴定'},
	1202128155: {msg: '群体拉人'},

	1202128053: {msg: '(击倒)吹风'}
};

const FirstBossActionsTankHM = {
	1202127952: {msg: '(晕)前夹'},
	1202128952: {msg: '(晕)前夹'}
};

const SecondBossActionsHM = {
	1202128152: {msg: '(秒杀)爆炸'}
};

const SecondBossActionsTankHM = {

};

const ThirdBossActionsHM = {
	1202127964: {msg: '右 →↘'},
	1202128964: {msg: '右 →↘'},
	1202127967: {msg: '右 →↘'},
	1202128967: {msg: '右 →↘'},

	1202127965: {msg: '左 ←↙'},
	1202128965: {msg: '左 ←↙'},
	1202127966: {msg: '左 ←↙'},
	1202128966: {msg: '左 ←↙'},

//	1202128153: {msg: '鉴定'},
//	1202128169: {msg: '破盾!!'},
	1202128172: {msg: '内圈晕人'}
};

const ThirdBossActionsTankHM = {
	
};

module.exports = function rk9guide(d) {

	let firstskill = 0,
		secondskill = 0,
		tempskill = 0,
		uid = 999999999,
		time = 1000,
		timer = 0,
		secondcounter = 0,
		cid,
		name,
		boss,
		bosshp,
		model,
		zone,
		mode,
		dungeonmsg,
		shieldwarning,
		job = -1,
		whichboss = 0,
		whichmode = 0,

		enabled = config.enabled,
		itemhelper = config.itemhelper,
		sendToParty = config.sendToParty,
		lastbosstoparty = config.lastbosstoparty,
		streamenabled = config.streamenabled,

		isTank = false,
		warned = false,
		insidemap = false,
		insidezone = false,
		checklastboss = true,
		kr = false;

// For Inputting commands, Toggle functions ETC 
	d.command.add('rkg', (arg) => {
		if (!insidemap) {
			d.command.message('你必须进入 [RK-9] 副本!'.clr('FF0000'));
			return;
		}
		if (!arg) {
			enabled = !enabled;
			d.command.message('RK-9机库 辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "party":
					sendToParty = !sendToParty;
					d.command.message('发送消息: ' + (sendToParty ? '组队频道'.clr('56B4E9') : '仅你自己'.clr('E69F00')));
					break;
				case "last":
					lastbosstoparty = !lastbosstoparty;
					d.command.message('尾王通知: ' + (lastbosstoparty ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "proxy":
					streamenabled = !streamenabled;
					d.command.message('代理频道 ' + (streamenabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "help":
					itemhelper = !itemhelper;
					d.command.message('地面辅助 ' + (itemhelper ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "tank":
					isTank = !isTank;
					d.command.message('坦克角色 ' + (isTank ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "kr":
					kr = !kr;
					d.command.message('KR ' + (kr ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "info":
					d.command.message(mode);
					d.command.message('模块开关: ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					d.command.message('攻击提示: ' + (sendToParty ? '发送到组队频道'.clr('56B4E9') : '只有你看到消息'.clr('E69F00')));
					d.command.message('尾王通知: ' + (lastbosstoparty ? '发送到组队频道'.clr('56B4E9') : '只有你看到消息'.clr('E69F00')));
					d.command.message('地面辅助: ' + (itemhelper ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					d.command.message('代理频道: ' + (streamenabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					d.command.message('坦克角色: ' + (isTank ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "debug":
					d.command.message('区域位置: ' + insidezone);
					d.command.message('地图位置: ' + insidemap);
					d.command.message('副本难度: ' + whichmode);
					d.command.message('副本首领: ' + whichboss);
					d.command.message('地面辅助: ' + itemhelper);
					d.command.message('KR: ' + kr);
					break;
				default :
					d.command.message('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('S_SPAWN_NPC', 9, sSpawnNpc)
	d.hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo)
	d.hook('S_DUNGEON_EVENT_MESSAGE', 2, sDungeonEventMessage)
	d.hook('S_QUEST_BALLOON', 1, sQuestBalloon)
	d.hook('S_ACTION_STAGE', 8, sActionStage)
	d.hook('S_CHAT', 2, sChat)

	function sLogin(event) {
		cid = event.gameId;
		model = event.templateId;
		name = event.name;
		job = model % 100;
		if (!kr) {
			kr = (d.base.majorPatchVersion < 74) ? false : true;
		}
		if (!isTank) { // Check if class = Lancer / Brawler
			isTank = ((job === 2 || job === 11) ? true : false);
		}
	}

	function sLoadTopo(event) {				// Welcome Message upon entering dungeon
		zone = event.zone;								// Edit Message if neccessary
		clearTimeout(shieldwarning);
		if (zone == mapID[0]) {
			insidemap = true;
			whichmode = 1; //1 = NM
			dungeonmode();
			initialize();
			d.command.message('进入副本: ' + 'RK-9机库 '.clr('56B4E9') + '[下级]'.clr('E69F00'));
			return;
		} else if (zone == mapID[1]) {
			insidemap = true;
			whichmode = 2; //2 = HM
			dungeonmode();
			initialize();
			d.command.message('进入副本: ' + 'RK-9机库 '.clr('56B4E9') + '[上级]'.clr('00FFFF'));
			return;
		} else {
			insidemap = false;
		}
    }

// DO NOT EDIT IF UN-SURE
	function sSpawnNpc(event) {
		if (!enabled) return;
		if (!itemhelper) return;

		if (insidemap && insidezone) {
			if (whichmode == 1 && whichboss == 2) {
				if (event.templateId == 2007) {
					timer = 5000;
					secondbossorbs(event, timer);
				}
			} else if (whichmode == 2 && whichboss == 2) {
				if (event.templateId == 2007) {
					if (secondcounter == 0) {
						timer = 12000;
						secondbossorbs(event, timer);
						secondcounter++;
						setTimeout(function () {
							secondcounter = 0;
						}, 15000);
					} else if (secondcounter == 1) {
						timer = 8000;
						secondbossorbs(event, timer);
						secondcounter++;
					} else if (secondcounter == 2) {
						timer = 4000;
						secondbossorbs(event, timer);
						secondcounter = 0;
					}
				}
			}
		}
	}
// DO NOT EDIT IF UN-SURE
	function sBossGageInfo(event) {
		if (!enabled) return;
		bosshp = (event.curHp / event.maxHp);

		if (event.maxHp == event.curHp) {
			initialize();
		}

		if (whichboss != 0) {
			if (bosshp <= 0) {
				whichboss = 0;
				warned = false;
				clearTimeout(shieldwarning);
				return;
			}
		}

		if (event.huntingZoneId == HuntingZn[0]) { //NM
			whichmode = 1;
			insidezone = true;
			if (event.templateId == BossID[0]) {
				whichboss = 1;
				boss = event.id;
			}
			if (event.templateId == BossID[1]) {
				whichboss = 2;
				boss = event.id;
			}
			if (event.templateId == BossID[2]) {
				whichboss = 3;
				boss = event.id;
			}
		} else if (event.huntingZoneId == HuntingZn[1]) { //HM
			whichmode = 2;
			insidezone = true;
			if (event.templateId == BossID[0]) {
				whichboss = 1;
				boss = event.id;
			}
			if (event.templateId == BossID[1]) {
				whichboss = 2;
				boss = event.id;
			}
			if (event.templateId == BossID[2]) {
				whichboss = 3;
				boss = event.id;
				if (bosshp <= 0.70 && !warned) {
					warned = true;
					sendMessage('Boss HP<70%');
				}
			}
		} else {
			insidezone = false;
		}
	}

	function sDungeonEventMessage(event) {
		if (!enabled || whichboss == 0) return;

		let sDungeonEventMessage = parseInt(event.message.replace('@dungeon:', ''));

		if (sDungeonEventMessage === 9935311) { //STANDARD
			firstskill = tempskill;
			secondskill = MsgID[0];
			sendMessage('Next: ' + firstskill + ' + ' + secondskill);
		}
		else if (sDungeonEventMessage === 9935312) { //REVERSE
			secondskill = tempskill;
			firstskill = MsgID[0];
			sendMessage('Next: ' + firstskill + ' + ' + secondskill);
		}

		if (!checklastboss) return;

		if (sDungeonEventMessage === 9935302) {
			firstskill = MsgID[1];
			tempskill = MsgID[1];
			checklastboss = false;
			if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[1] });}, 3000); }
		} else if (sDungeonEventMessage === 9935303) {
			firstskill = MsgID[2];
			tempskill = MsgID[2];
			checklastboss = false;
			if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[2] });}, 3000); }
		} else if (sDungeonEventMessage === 9935304) {
			firstskill = MsgID[3];
			tempskill = MsgID[3];
			checklastboss = false;
			if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[3] });}, 3000); }
		}
	}

	function sQuestBalloon(event) {
		if (!enabled) return;

		if (insidezone && insidemap) {
			dungeonmsg = parseInt(event.message.replace('@monsterBehavior:', ''));
			if (firstskill === MsgID[0]) { //REVERSE
				if (dungeonmsg === 935301) {
					firstskill = MsgID[1];
					tempskill = MsgID[1];
					sendMessage( firstskill + ' -> ' + secondskill );
					secondskill = tempskill;
					firstskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[1] });}, 8000); }
				} else if (dungeonmsg === 935302) {
					firstskill = MsgID[2];
					tempskill = MsgID[2];
					sendMessage( firstskill + ' -> ' + secondskill );
					secondskill = tempskill;
					firstskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[2] });}, 8000); }
				} else if (dungeonmsg === 935303) {
					firstskill = MsgID[3];
					tempskill = MsgID[3];
					sendMessage( firstskill + ' -> ' + secondskill );
					secondskill = tempskill;
					firstskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[3] });}, 8000); }
				}
			} else if (secondskill === MsgID[0]) { //STANDARD
				if (dungeonmsg === 935301) {
					secondskill = MsgID[1];
					tempskill = MsgID[1];
					sendMessage( firstskill + ' -> ' + secondskill );
					firstskill = tempskill;
					secondskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[0] });}, 8000); }
				} else if (dungeonmsg === 935302) {
					secondskill = MsgID[2];
					tempskill = MsgID[2];
					sendMessage( firstskill + ' -> ' + secondskill );
					firstskill = tempskill;
					secondskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[1] });}, 8000); }
				} else if (dungeonmsg === 935303) {
					secondskill = MsgID[3];
					tempskill = MsgID[3];
					sendMessage( firstskill + ' -> ' + secondskill );
					firstskill = tempskill;
					secondskill = MsgID[0];
					if (lastbosstoparty) {setTimeout(function() {d.toServer('C_CHAT', 1, {channel: 21, message: MsgID[2] });}, 8000); }
				}
			}
			return;
		}
		return;
	}
// DO NOT EDIT IF UN-SURE
	function sActionStage(event) {
		if (!enabled) return;

		if (insidezone && insidemap) { // Main script for calling out attacks
			bossCurLocation = {x:event.loc.x, y:event.loc.y, z:event.loc.z, w:event.w};
			let skillid = event.skill;
			if (kr && whichmode == 1) {
				if (event.skill.id - 352 >= 1000) {
					skillid = "118902" + (event.skill.id - 352);
				} else {
					skillid = "1189020" + (event.skill.id - 352);
				}
			}
			if (kr && whichmode == 2) {
				if (event.skill.id + 6848 >= 1000) {
					skillid = "120212" + (event.skill.id + 6848);
				} else {
					skillid = "1202120" + (event.skill.id + 6848);
				}
			}
	if (event.stage === 0) {
			if (whichmode == 1) { // Normal Mode
				if (whichboss == 1) {
					if (FirstBossActions[skillid]) {
						sendMessage(FirstBossActions[skillid].msg);
					}
					if (isTank) {
						if (FirstBossActionsTank[skillid]) {
							sendMessage(FirstBossActionsTank[skillid].msg);
						}
					}
					if (skillid == 1189020957) {
						setTimeout(function() {
							sendMessage(JUMP);
						}, 11000); 
					}
				}

				if (whichboss == 2) {
					if (SecondBossActions[skillid]) {
						sendMessage(SecondBossActions[skillid].msg);
					}
					if (isTank) {
						if (SecondBossActionsTank[skillid]) {
							sendMessage(SecondBossActionsTank[skillid].msg);
						}
					}
				}

				if (whichboss == 3) {
					if (ThirdBossActions[skillid]) {
						sendMessage(ThirdBossActions[skillid].msg);
					}
					if (isTank) {
						if (ThirdBossActionsTank[skillid]) {
							sendMessage(ThirdBossActionsTank[skillid].msg);
						}
					}
					if (skillid == 1189020969) {
						shieldwarning = setTimeout(function() {
							sendMessage(NOTOCE);
						}, 90000);
					}
					if (itemhelper) { //左/右 S拳
						if (skillid == 1189020764 || skillid == 1189021764 || skillid == 1189020767 || skillid == 1189021767) {
							Spawnitem(556, 3000, 190,200);
							Spawnitem(556, 3000, 10,200);
						}
						if (skillid == 1189020765 || skillid == 1189021765 || skillid == 1189020766 || skillid == 1189021766) {
							Spawnitem(556, 3000, 170, 200);
							Spawnitem(556, 3000, 350, 200);
						}
					}
				}
			}

			if (whichmode == 2) { //HARD MODE
				if (whichboss == 1) {
					if (FirstBossActionsHM[skillid]) {
						sendMessage(FirstBossActionsHM[skillid].msg);
					}
					if (isTank) {
						if (FirstBossActionsTankHM[skillid]) {
							sendMessage(FirstBossActionsTankHM[skillid].msg);
						}
					}
					if (skillid == 1202128157) {
						setTimeout(function() {
							sendMessage(JUMP);
						}, 11000);
					}
				}

				if (whichboss == 2) {
					if (SecondBossActionsHM[skillid]) {
						sendMessage(SecondBossActionsHM[skillid].msg);
					}
					if (isTank) {
						if (SecondBossActionsTankHM[skillid]) {
							sendMessage(SecondBossActionsTankHM[skillid].msg);
						}
					}
				}

				if (whichboss == 3) {
					if (ThirdBossActionsHM[skillid]) {
						sendMessage(ThirdBossActionsHM[skillid].msg);
					}
					if (isTank) {
						if (ThirdBossActionsTankHM[skillid]) {
							sendMessage(ThirdBossActionsTankHM[skillid].msg);
						}
					}
					if (skillid == 1202128169) {
						shieldwarning = setTimeout(function() {
							sendMessage(NOTOCE);
						}, 105000);
					}
					if (itemhelper) { //左/右 S拳
						if (skillid == 1202127964 || skillid == 1202128964 || skillid == 1202127967 || skillid == 1202128967) {
							Spawnitem(556, 3000, 190,200);
							Spawnitem(556, 3000, 10,200);
						}
						if (skillid == 1202127965 || skillid == 1202128965 || skillid == 1202127966 || skillid == 1202128966) {
							Spawnitem(556, 3000, 170, 200);
							Spawnitem(556, 3000, 350, 200);
						}

						if (skillid == 1202128153) { // 远/近 鉴定范围
							Spawnitem(603, 7000, 20, 300);
							Spawnitem(603, 7000, 40, 300);
							Spawnitem(603, 7000, 60, 300);
							Spawnitem(603, 7000, 80, 300);
							Spawnitem(603, 7000, 100, 300);
							Spawnitem(603, 7000, 120, 300);
							Spawnitem(603, 7000, 140, 300);
							Spawnitem(603, 7000, 160, 300);
							Spawnitem(603, 7000, 180, 300);
							Spawnitem(603, 7000, 200, 300);
							Spawnitem(603, 7000, 220, 300);
							Spawnitem(603, 7000, 240, 300);
							Spawnitem(603, 7000, 260, 300);
							Spawnitem(603, 7000, 280, 300);
							Spawnitem(603, 7000, 300, 300);
							Spawnitem(603, 7000, 320, 300);
							Spawnitem(603, 7000, 340, 300);
							Spawnitem(603, 7000, 360, 300);
							setTimeout(function() {
							sendMessage('Next: ' + firstskill + ' + ' + secondskill );
							}, 5500);
						}
					}
				}
			}
	} else if (event.stage === 3) {
			if (whichmode != 0 && whichboss == 3 && itemhelper) { // 3王 S拳 弧线安全区域
				 // 下级
				if (skillid == 1189020764 || skillid == 1189021764 || skillid == 1189020767 || skillid == 1189021767) {
					Spawnitem(603, 3000, 190,210);
					Spawnitem(603, 3000, 190,230);
					Spawnitem(603, 3000, 190,250);
					Spawnitem(603, 3000, 190,270);
					Spawnitem(603, 3000, 190,290);
					Spawnitem(603, 3000, 200,210);
					Spawnitem(603, 3000, 210,220);
					Spawnitem(603, 3000, 220,230);
					Spawnitem(603, 3000, 230,240);
					Spawnitem(603, 3000, 240,250);
					Spawnitem(603, 3000, 10,210);
					Spawnitem(603, 3000, 10,230);
					Spawnitem(603, 3000, 10,250);
					Spawnitem(603, 3000, 10,270);
					Spawnitem(603, 3000, 10,290);
					Spawnitem(603, 3000, 20,210);
					Spawnitem(603, 3000, 30,220);
					Spawnitem(603, 3000, 40,230);
					Spawnitem(603, 3000, 50,240);
					Spawnitem(603, 3000, 60,250);
				}
				if (skillid == 1189020765 || skillid == 1189021765 || skillid == 1189020766 || skillid == 1189021766) {
					Spawnitem(603, 3000, 170, 210);
					Spawnitem(603, 3000, 170, 230);
					Spawnitem(603, 3000, 170, 250);
					Spawnitem(603, 3000, 170, 270);
					Spawnitem(603, 3000, 170, 290);
					Spawnitem(603, 3000, 160, 210);
					Spawnitem(603, 3000, 150, 220);
					Spawnitem(603, 3000, 140, 230);
					Spawnitem(603, 3000, 130, 240);
					Spawnitem(603, 3000, 120, 250);
					Spawnitem(603, 3000, 350, 210);
					Spawnitem(603, 3000, 350, 230);
					Spawnitem(603, 3000, 350, 250);
					Spawnitem(603, 3000, 350, 270);
					Spawnitem(603, 3000, 350, 290);
					Spawnitem(603, 3000, 340, 210);
					Spawnitem(603, 3000, 330, 220);
					Spawnitem(603, 3000, 320, 230);
					Spawnitem(603, 3000, 310, 240);
					Spawnitem(603, 3000, 300, 250);
				}
				// 上级
				if (skillid == 1202127964 || skillid == 1202128964 || skillid == 1202127967 || skillid == 1202128967) {
					Spawnitem(603, 3000, 190,210);
					Spawnitem(603, 3000, 190,230);
					Spawnitem(603, 3000, 190,250);
					Spawnitem(603, 3000, 190,270);
					Spawnitem(603, 3000, 190,290);
					Spawnitem(603, 3000, 200,210);
					Spawnitem(603, 3000, 210,220);
					Spawnitem(603, 3000, 220,230);
					Spawnitem(603, 3000, 230,240);
					Spawnitem(603, 3000, 240,250);
					Spawnitem(603, 3000, 10,210);
					Spawnitem(603, 3000, 10,230);
					Spawnitem(603, 3000, 10,250);
					Spawnitem(603, 3000, 10,270);
					Spawnitem(603, 3000, 10,290);
					Spawnitem(603, 3000, 20,210);
					Spawnitem(603, 3000, 30,220);
					Spawnitem(603, 3000, 40,230);
					Spawnitem(603, 3000, 50,240);
					Spawnitem(603, 3000, 60,250);
				}
				if (skillid == 1202127965 || skillid == 1202128965 || skillid == 1202127966 || skillid == 1202128966) {
					Spawnitem(603, 3000, 170, 210);
					Spawnitem(603, 3000, 170, 230);
					Spawnitem(603, 3000, 170, 250);
					Spawnitem(603, 3000, 170, 270);
					Spawnitem(603, 3000, 170, 290);
					Spawnitem(603, 3000, 160, 210);
					Spawnitem(603, 3000, 150, 220);
					Spawnitem(603, 3000, 140, 230);
					Spawnitem(603, 3000, 130, 240);
					Spawnitem(603, 3000, 120, 250);
					Spawnitem(603, 3000, 350, 210);
					Spawnitem(603, 3000, 350, 230);
					Spawnitem(603, 3000, 350, 250);
					Spawnitem(603, 3000, 350, 270);
					Spawnitem(603, 3000, 350, 290);
					Spawnitem(603, 3000, 340, 210);
					Spawnitem(603, 3000, 330, 220);
					Spawnitem(603, 3000, 320, 230);
					Spawnitem(603, 3000, 310, 240);
					Spawnitem(603, 3000, 300, 250);
				}
			}
	} else if (event.stage === 1) {
			if (whichmode == 2 && whichboss == 1 && itemhelper) { // 上级 1王 披萨鉴定 安全区
				if (skillid == 1202128167) { //Safe front right
					Spawnitem(559, 9000, 338,120);
				}
				if (skillid == 1202128163) {
					Spawnitem(559, 9000, 338,120);
				}
				if (skillid == 1202129167) {
					Spawnitem(559, 9000, 338,120);
				}
				if (skillid == 1202129163) {
					Spawnitem(559, 9000, 338,120);
				}

				if (skillid == 1202128174) { //Safe front left
					Spawnitem(559, 9000, 23,120);
				}
				if (skillid == 1202128162) {
					Spawnitem(559, 9000, 23,120);
				}
				if (skillid == 1202129174) {
					Spawnitem(559, 9000, 23,120);
				}
				if (skillid == 1202129162) {
					Spawnitem(559, 9000, 23,120);
				}

				if (skillid == 1202128172) { //Safe right back
					Spawnitem(559, 9000, 248,120);
				}
				if (skillid == 1202129172) {
					Spawnitem(559, 9000, 248,120);
				}
				if (skillid == 1202128160) {
					Spawnitem(559, 9000, 248,120);
				}
				if (skillid == 1202129160) {
					Spawnitem(559, 9000, 248,120);
				}

				if (skillid == 1202128159) { //Safe right front
					Spawnitem(559, 9000, 293,120);
				}
				if (skillid == 1202129159) {
					Spawnitem(559, 9000, 293,120);
				}
				if (skillid == 1202128171) {
					Spawnitem(559, 9000, 293,120);
				}
				if (skillid == 1202129171) {
					Spawnitem(559, 9000, 293,120);
				}

				if (skillid == 1202128173) { //Safe left back
					Spawnitem(559, 9000, 113,120);
				}
				if (skillid == 1202129173) {
					Spawnitem(559, 9000, 113,120);
				}
				if (skillid == 1202128165) {
					Spawnitem(559, 9000, 113,120);
				}
				if (skillid == 1202129165) {
					Spawnitem(559, 9000, 113,120);
				}

				if (skillid == 1202128166) { //Safe left front
					Spawnitem(559, 9000, 68,120);
				}
				if (skillid == 1202129166) {
					Spawnitem(559, 9000, 68,120);	
				}
				if (skillid == 1202128170) {
					Spawnitem(559, 9000, 68,120);
				}
				if (skillid == 1202129170) {
					Spawnitem(559, 9000, 68,120);	
				}

				if (skillid == 1202128169) { //Safe back left
					Spawnitem(559, 9000, 158,120);
				}
				if (skillid == 1202129169) {
					Spawnitem(559, 9000, 158,120);
				}
				if (skillid == 1202128161) {
					Spawnitem(559, 9000, 158,120);
				}
				if (skillid == 1202129161) {
					Spawnitem(559, 9000, 158,120);
				}

				if (skillid == 1202128164) { //Safe back right
					Spawnitem(559, 9000, 203,120);
				}
				if (skillid == 1202129164) {
					Spawnitem(559, 9000, 203,120);
				}
				if (skillid == 1202128168) {
					Spawnitem(559, 9000, 203,120);
				}
				if (skillid == 1202129168) {
					Spawnitem(559, 9000, 203,120);
				}
			}
	}
		}
	}

	function sChat(event) {
		if (insidezone && insidemap && event.channel == 21 && event.authorID.notEquals(cid)) {
			event.channel = 1
			return true
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

	function dungeonmode() { // 判定上级/下级
		if (whichmode == 1) {
			mode = ModeID[0];
		} else if (whichmode == 2) {
			mode = ModeID[1];
		} else {
			mode = ' unknown';
		}
	}

	function initialize() { // 重置数据
		secondcounter = 0;
		firstskill = MsgID[0];
		secondskill = MsgID[0];
		tempskill = MsgID[0];

		warned = false;
		checklastboss = true;
		clearTimeout(shieldwarning);
	}

	function spawn2(item, time, degrees, radius, loca) {
		let r = null,
			rads = null,
			finalrad = null,
			spawnx = null,
			spawny = null,
			pos = null;

		r = loca.w;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = loca.loc.x + radius * Math.cos(finalrad);
		spawny = loca.loc.y + radius * Math.sin(finalrad);
		pos = {x:spawnx,y:spawny};

		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, loca.loc.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});

		setTimeout(Despawn, time, uid)
		uid--;
	}

	function Spawnitem(item, time, degrees, radius) {
		let r = null,
			rads = null,
			finalrad = null,
			spawnx = null,
			spawny = null,
			pos = null;

		r = bossCurLocation.w;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = bossCurLocation.x + radius * Math.cos(finalrad);
		spawny = bossCurLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};

		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, bossCurLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});

		setTimeout(Despawn, time, uid)
		uid--;
	}

	function secondbossorbs(pos, timer) { // 2王 点名球 十字线
		spawn2(603, timer, 0, 25, pos);
		spawn2(603, timer, 0, 50, pos);
		spawn2(603, timer, 0, 75, pos);
		spawn2(603, timer, 0, 100, pos);
		spawn2(603, timer, 0, 125, pos);
		spawn2(603, timer, 0, 150, pos);
		spawn2(603, timer, 0, 175, pos);
		spawn2(603, timer, 0, 200, pos);
		spawn2(603, timer, 0, 225, pos);
		spawn2(603, timer, 0, 250, pos);
		spawn2(603, timer, 0, 275, pos);
		spawn2(603, timer, 0, 300, pos);
		spawn2(603, timer, 0, 325, pos);
		spawn2(603, timer, 0, 350, pos);
		spawn2(603, timer, 0, 375, pos);
		spawn2(603, timer, 0, 400, pos);
		spawn2(603, timer, 0, 425, pos);
		spawn2(603, timer, 0, 450, pos);
		spawn2(603, timer, 0, 475, pos);
		spawn2(603, timer, 0, 500, pos);

		spawn2(603, timer, 90, 25, pos);
		spawn2(603, timer, 90, 50, pos);
		spawn2(603, timer, 90, 75, pos);
		spawn2(603, timer, 90, 100, pos);
		spawn2(603, timer, 90, 125, pos);
		spawn2(603, timer, 90, 150, pos);
		spawn2(603, timer, 90, 175, pos);
		spawn2(603, timer, 90, 200, pos);
		spawn2(603, timer, 90, 225, pos);
		spawn2(603, timer, 90, 250, pos);
		spawn2(603, timer, 90, 275, pos);
		spawn2(603, timer, 90, 300, pos);
		spawn2(603, timer, 90, 325, pos);
		spawn2(603, timer, 90, 350, pos);
		spawn2(603, timer, 90, 375, pos);
		spawn2(603, timer, 90, 400, pos);
		spawn2(603, timer, 90, 425, pos);
		spawn2(603, timer, 90, 450, pos);
		spawn2(603, timer, 90, 475, pos);
		spawn2(603, timer, 90, 500, pos);

		spawn2(603, timer, 180, 25, pos);
		spawn2(603, timer, 180, 50, pos);
		spawn2(603, timer, 180, 75, pos);
		spawn2(603, timer, 180, 100, pos);
		spawn2(603, timer, 180, 125, pos);
		spawn2(603, timer, 180, 150, pos);
		spawn2(603, timer, 180, 175, pos);
		spawn2(603, timer, 180, 200, pos);
		spawn2(603, timer, 180, 225, pos);
		spawn2(603, timer, 180, 250, pos);
		spawn2(603, timer, 180, 275, pos);
		spawn2(603, timer, 180, 300, pos);
		spawn2(603, timer, 180, 325, pos);
		spawn2(603, timer, 180, 350, pos);
		spawn2(603, timer, 180, 375, pos);
		spawn2(603, timer, 180, 400, pos);
		spawn2(603, timer, 180, 425, pos);
		spawn2(603, timer, 180, 450, pos);
		spawn2(603, timer, 180, 475, pos);
		spawn2(603, timer, 180, 500, pos);

		spawn2(603, timer, 270, 25, pos);
		spawn2(603, timer, 270, 50, pos);
		spawn2(603, timer, 270, 75, pos);
		spawn2(603, timer, 270, 100, pos);
		spawn2(603, timer, 270, 125, pos);
		spawn2(603, timer, 270, 150, pos);
		spawn2(603, timer, 270, 175, pos);
		spawn2(603, timer, 270, 200, pos);
		spawn2(603, timer, 270, 225, pos);
		spawn2(603, timer, 270, 250, pos);
		spawn2(603, timer, 270, 275, pos);
		spawn2(603, timer, 270, 300, pos);
		spawn2(603, timer, 270, 325, pos);
		spawn2(603, timer, 270, 350, pos);
		spawn2(603, timer, 270, 375, pos);
		spawn2(603, timer, 270, 400, pos);
		spawn2(603, timer, 270, 425, pos);
		spawn2(603, timer, 270, 450, pos);
		spawn2(603, timer, 270, 475, pos);
		spawn2(603, timer, 270, 500, pos);
	}

	function Despawn(uid) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid
		});
	}

}
