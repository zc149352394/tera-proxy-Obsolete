String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const Vec3 = require('tera-vec3');
// 定义恒量 
const mapID = [9783, 9983];							// 地区坐标 zone 区分副本 下/上级
const HuntingZn = [783, 983];						// 大型怪物 huntingZoneId 区分副本 下/上级
const BossID = [1000, 2000, 3000];					// 大型怪物 templateId 区分副本 1-2-3王
// 获取配置文档数据
const config = require('./config.json');
const {FirstBossActions, SecondBossActions, ThirdBossActions} = require('./skills');

module.exports = function DarkReachCitadelGuide(d) {	// 定义变量
	let	enabled = config.enabled,					// 模块启动开关
		sendToParty = config.sendToParty,			// 发送真实组队频道通知
		streamenabled = config.streamenabled,		// 关闭队长通知, 并将消息发送到代理频道

		isTank = false,								// 坦克职业 / 打手职业
		insidemap = false,							// 确认进入副本地图
		insidezone = false,							// 确认进入BOSS地图
		whichmode = 0,								// 确认副本上/下级
		whichboss = 0,								// 判定当前是哪个王

		hooks = [],
		bossCurLocation,
		bossCurAngle,
		uid0 = 999999999,
		uid1 = 899999999,
		uid2 = 799999999;

	d.command.add('drc', (arg) => {
		if (!arg) {
			enabled = !enabled;
			d.command.message('辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "p":
				case "party":
					sendToParty = !sendToParty;
					d.command.message('发送通知 ' + (sendToParty ? '组队'.clr('56B4E9') : '自己'.clr('E69F00')));
					break;
				case "proxy":
					streamenabled = !streamenabled;
					d.command.message('代理频道 ' + (streamenabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "debug":
					d.command.message('模块开关: ' + `${enabled}`.clr('00FFFF'));
					d.command.message('副本地图: ' + insidemap);
					d.command.message('区域位置: ' + insidezone);
					d.command.message('副本难度: ' + whichmode);
					d.command.message('副本首领: ' + whichboss);
					d.command.message('发送通知 ' + (sendToParty ? '真实组队'.clr('56B4E9') : '仅自己见'.clr('E69F00')));
					d.command.message('职业分类 ' + (isTank ? '坦克'.clr('00FFFF') : '打手'.clr('FF0000')));
					sendMessage('test');
					break;
				default :
					d.command.message('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 10, sLogin)						// 获取 登入角色信息
	d.hook('S_LOAD_TOPO', 3, sLoadTopo);				// 获取 登陆地区信息

	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {					// 0-双刀, 1-枪骑, 2-大剑, 3-斧头, 4-魔道
			isTank = true;								// 5-弓箭, 6-祭司, 7-元素, 8-飞镰, 9-魔工
		} else {										// 10-拳师, 11-忍者 12 月光
			isTank = false;
		}
	}

	function sLoadTopo(event) {
		if (event.zone === mapID[0]) {
			insidemap = true;
			d.command.message('进入副本: ' + '泰内布利斯城堡 '.clr('56B4E9') + '[下级]'.clr('E69F00'));
			load();
		} else if (event.zone === mapID[1]) {
			insidemap = true;
			d.command.message('进入副本: ' + '泰内布利斯城堡 '.clr('56B4E9') + '[上级]'.clr('00FFFF'));
			load();
		} else {
			unload();
		}
    }
	// 加载 获取信息
	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);					// 获取 大型怪物血量信息
			hook('S_ACTION_STAGE', 8, sActionStage);					// 获取 周围全部[攻击动作]事件
			hook('S_DUNGEON_EVENT_MESSAGE', 2,sDungeonEventMessage);	// 获取 副本事件触发 消息提示

			function sBossGageInfo(event) {
				if (!insidemap) return;

				let bosshp = (event.curHp / event.maxHp);

				if (bosshp <= 0) {
					whichboss = 0;
				}
				// 进入副本
				if (event.huntingZoneId == HuntingZn[0]) {			// 下级副本
					insidezone = true;
					whichmode = 1;
				} else if (event.huntingZoneId == HuntingZn[1]) {	// 上级副本
					insidezone = true;
					whichmode = 2;
				} else {
					insidezone = false;
					whichmode = 0;
				}
				// 进入王的区域
				if (event.templateId == BossID[0]) whichboss = 1;		
				else if (event.templateId == BossID[1]) whichboss = 2;
				else if (event.templateId == BossID[2]) whichboss = 3;
				else whichboss = 0;
			}

			function sActionStage(event) {
				// 模块关闭 或 不在副本中 或 找不到BOSS血条
				if (!enabled || !insidezone || whichboss==0) return;
				// 攻击技能 不是[1王] 也不是 [2王] 也不是 [3王] , 函数到此结束 (屏蔽 玩家/队友/NPC/召唤生物 攻击技能)
				if (event.templateId!=BossID[0] && event.templateId!=BossID[1] && event.templateId!=BossID[2]) return;
				let skillid = event.skill.id % 1000;		// 攻击技能编号简化 取1000余数运算
				bossCurLocation = event.loc;				// BOSS的 x y z 坐标
				bossCurAngle = event.w;						// BOSS的角度

				if (whichboss==1 && FirstBossActions[skillid]) {
					sendMessage(FirstBossActions[skillid].msg);
				}

				if (whichboss==2 && SecondBossActions[skillid]) {
					// 打手职业 不提示的技能
					if (!isTank && skillid === 110) return;
					// 坦克职业 不提示的技能
					if ( isTank && (skillid === 111 || skillid === 115)) return;
					// 2王 属性攻击 - 草地圈范围
					if (skillid === 318) {
						Spawnitem2(913, 680, 5000);
					}

					sendMessage(SecondBossActions[skillid].msg);
				}

				if (whichboss==3 && ThirdBossActions[skillid]) {
					// 打手职业 不提示的技能
					if (!isTank && (skillid === 106 || skillid === 109)) return;
					// 坦克职业 不提示的技能
					if ( isTank && skillid === 112) return;
					// 3王 S攻击
					if (skillid === 303 || skillid === 306) {
						// 王右侧 直线花朵
						Spawnitem1(913, 90, 250, 5000);
						// 王左侧 直线花朵
						Spawnitem1(913, 270, 250, 5000);
						// 王右侧 光柱+告示牌
						SpawnThing(ThirdBossActions[skillid].sign_degrees1, ThirdBossActions[skillid].sign_distance1);
						// 王左侧 光柱+告示牌
						SpawnThing(ThirdBossActions[skillid].sign_degrees2, ThirdBossActions[skillid].sign_distance2);
					}

					sendMessage(ThirdBossActions[skillid].msg);
				}
			}
			// 1王能量满100提醒
			function sDungeonEventMessage(event) {
				if (!enabled || !insidezone || whichboss==0) return;
				let sDungeonEventMessage = parseInt(event.message.replace('@dungeon:', ''));
				if (whichboss==1) {
					// 9783103下级触发; 9983103上级触发
					if (sDungeonEventMessage === 9783103 || sDungeonEventMessage === 9983103) {
						sendMessage('100能量鉴定!!');
					}
				}
			}
		}
	}
	// 获取信息
	function hook() {
		hooks.push(d.hook(...arguments));
	}
	// 卸载 获取信息
	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				d.unhook(h);
			hooks = [];
		}
		reset();
	}
	// 重置数据配置
	function reset() {
		insidemap = false;
		insidezone = false;
		whichmode = 0;
		whichboss = 0;
	}
	// 发送提示文字
	function sendMessage(msg) {
		if (sendToParty) {						// 真实队长通知频道
			d.toServer('C_CHAT', 1, {
				channel: 21, 					// 21 = 队长通知, 1 = 组队, 2 = 公会
				message: msg
			});
		} else if (streamenabled) {				// 代理频道
			d.command.message(msg);
		} else {
			d.toClient('S_CHAT', 2, {			// 虚拟队长通知频道
				channel: 21, 					// 21 = 队长通知, 1 = 组队, 25 = 团长通知
				authorName: 'DG-Guide',
				message: msg
			});
		}
	}
	//地面提示(花朵)
	function Spawnitem(item, degrees, radius, times) { // 显示物品 偏移角度 半径距离 持续时间
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;

		r = bossCurAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = bossCurLocation.x + radius * Math.cos(finalrad);
		spawny = bossCurLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};
		// 花朵
		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid0,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, bossCurLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});
		// 延时消除
		setTimeout(Despawn, times, uid0);
		uid0--;
	}
	// 消除花朵
	function Despawn(uid_arg0) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg0
		});
	}
	// 构造直线花朵
	function Spawnitem1(item, degrees, maxRadius, times) {  // 显示物品 偏移角度 最远距离 持续时间
		for (var radius=50; radius<=maxRadius; radius+=50) { // 距离间隔 25
			Spawnitem(item, degrees, radius, times); // 显示物品 偏移角度 半径距离 持续时间
		}
	}
	// 构造圆形花圈
	function Spawnitem2(item, radius, times) { // 显示物品 半径距离 持续时间
		for (var degrees=0; degrees<360; degrees+=20) { // 偏移间隔 20度
			Spawnitem(item, degrees, radius, times); // 显示物品 偏移角度 半径距离 持续时间
		}
	}
	// 地面提示(光柱+告示牌)
	function SpawnThing(degrees, radius, times) { // 偏移角度 半径距离 持续时间
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;

		r = bossCurAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = bossCurLocation.x + radius * Math.cos(finalrad);
		spawny = bossCurLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};
		// 告示牌
		d.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : new Vec3(pos.x, pos.y, bossCurLocation.z),
			w : r,
			unk : 0,
			ownerName : '提示',
			message : '安全区'
		});

		// 龙头光柱
		bossCurLocation.z = bossCurLocation.z - 1000;
		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			item: 98260,
			loc: new Vec3(pos.x, pos.y, bossCurLocation.z),
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		});
		bossCurLocation.z = bossCurLocation.z + 1000;

		// 延迟消除
		setTimeout(DespawnThing, 5000, uid1, uid2);
		uid1--;
		uid2--;
	}
	// 消除 光柱+告示牌
	function DespawnThing(uid_arg1, uid_arg2) {
		d.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1,
			unk : 0
		});
		d.toClient('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}

}
