String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json');

module.exports = function BoxOpener(dispatch) {

	let	hooks = [],
		enabled = config.enabled,
		boxEvent = null,
		gacha_detected = false,
		isLooting = false,
		location = null,
		timer = null,
		delay = 5000,
		useDelay = false,
		statOpened = 0,
		statUsed = 0,
		statStarted = null,
		scanning = false;
		boxId = 166901, // MWA box as default.
		inventory = null;

	dispatch.command.add(['box', 'bo'], () => {
		if (!enabled && !scanning) {
			scanning = true;
			load();
			dispatch.command.message('请正常打开一个盒子, 脚本会继续打开它'.clr('56B4E9'));
		} else {
			stop();
		}
	});

	dispatch.command.add('boxdelay', (arg) => {
		if (arg === "0") {
			useDelay = false;
			delay = 5000;
			dispatch.command.message('无延迟'.clr('56B4E9'));
		} else if (!isNaN(arg)) {
			useDelay = true;
			delay = parseInt(arg);
			dispatch.command.message('设置开盒最小间隔延迟为: ' + (delay / 1000) + ' 秒');
		} else {
			dispatch.command.message('设置开盒最小间隔延迟为: ' + (useDelay ? (delay / 1000) + ' 秒' : '无延迟'));
		}
    });

	dispatch.hook('C_PLAYER_LOCATION', 5, event => {
		location = event
	});

	function load() {
		hook('S_INVEN', 16, event => {
			if (!enabled) return

			isLooting = false; // S_INVEN comes only after all S_SYSTEM_MESSAGE_LOOT_ITEM

			if (event.first) inventory = []
			else if (!inventory) return

			for (let item of event.items) inventory.push(item)

			if (!event.more) {
				let box = false
				for (let item of inventory) {
					if (item.slot < 40) continue 
					if (item.id == boxId) {
						box = true
					}
				}
				if (!box) {
					dispatch.command.message('所有盒子开完 ' + '停止脚本'.clr('E69F00'));
					stop();
				}
				inventory.splice(0,inventory.length)
				inventory = [];
				inventory = null
			}
		});

		hook('C_USE_ITEM', 3, event => {
			if (!scanning) return
		
			if (scanning) {
				boxEvent = event;
				boxId = event.id;
				dispatch.command.message('选定盒子编号: <font color="#FF0000">' + boxId + '</font>, 脚本自动开启 '  + (useDelay ? '分钟 ' + (delay / 1000) + ' 秒延迟' : '无延迟'));
				scanning = false;

				let d = new Date();
				statStarted = d.getTime();
				enabled = true;
				timer = setTimeout(openBox, delay);
			}
		});

		hook('S_SYSTEM_MESSAGE_LOOT_ITEM', 1, event => {
			if (!gacha_detected && !isLooting) {
				isLooting = true;
				statOpened++;
				if (!useDelay) {
					clearTimeout(timer);
					openBox();
				}
			}
		});

		hook('S_GACHA_END', 1, event => {
			statOpened++;
			if (!useDelay) {
				clearTimeout(timer);
				openBox();
			}
		});

		hook('S_SYSTEM_MESSAGE', 1, event => {
			const msg = dispatch.base.parseSystemMessage(event.message);
			if (msg.id === 'SMT_ITEM_MIX_NEED_METERIAL' || msg.id === 'SMT_CANT_CONVERT_NOW') {
				dispatch.command.message('不再开启盒子 ' + '脚本停止'.clr('E69F00'));
				stop();
			}
        });

		hook('S_GACHA_START', 1, event => {
			gacha_detected = true;
			dispatch.toServer('C_GACHA_TRY', 1, {
				id:event.id
			})
        });	
	}

	function openBox() {
		boxEvent.loc = location.loc;
		boxEvent.w = location.w;
		dispatch.toServer('C_USE_ITEM', 3, boxEvent);
		if (useDelay) {
			statUsed++;	// counter for used items other than boxes
		}
		timer = setTimeout(openBox,delay);
	}

	function addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}

	function stop() {
		unload();
		if (scanning) {
			scanning = false;
			dispatch.command.message('自动开盒脚本 ' + '关闭'.clr('E69F00'));
		} else {
			clearTimeout(timer);
			enabled = false;
			gacha_detected = false;
			if (useDelay && statOpened == 0) {
				statOpened = statUsed;
			}
			let d = new Date();
			let t = d.getTime();
			let timeElapsedMSec = t - statStarted;
			d = new Date(1970, 0, 1); // Epoch
			d.setMilliseconds(timeElapsedMSec);
			let h = addZero(d.getHours());
			let m = addZero(d.getMinutes());
			let s = addZero(d.getSeconds());
			dispatch.command.message(
				'自动开盒脚本. 已完成: <font color="#FF0000">' + statOpened + '</font> 个盒子 ' +
				'用时: <font color="#FF0000">' + (h + ":" + m + ":" + s) + '</font> ' +
				'平均每个盒子: <font color="#FF0000">' + ((timeElapsedMSec / statOpened) / 1000).toPrecision(2) + '</font> 秒'
			);
			statOpened = 0;
			statUsed = 0;
		}
	}

	function unload() {
		if (hooks.length) {
			for (let h of hooks) dispatch.unhook(h)
			hooks = []
		}
	}

	function hook() {
		hooks.push(dispatch.hook(...arguments))
	}

}
