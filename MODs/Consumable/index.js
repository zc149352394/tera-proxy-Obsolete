const Consumables = {
	4020: '高級-戰鬥秘藥',					// 200999
	4021: '高級戰鬥秘藥 2',

	4030: '萬能-戰鬥秘藥 (VIP)',
	4031: '萬能戰鬥秘藥 2',

	4610: '完整的水晶防護卷軸 (12小时)',
	4612: '完整的-水晶防護卷軸 (1小时)',	// 98526
	4615: '完整的水晶防護卷軸 3',
	4616: '完整的水晶防護卷軸 4',

	4830: '勇猛的藥水',						// 202015
	4831: '勇猛的藥水 (網咖)',
	4833: '勇猛的藥水 2',
	4886: '勇猛藥水 II',					// 222693

	70221: '烤羊肉',						// 71418 220428

	920:  '精製綠鈦效果 [高級]',			// 
	921:  '精製綠鈦效果 [稀有]',			// 200921
	922:  '精製綠鈦效果 [傳說]'				// 200922
};

module.exports = function NotifyConsumableExpiry(dispatch) {

	let gameId = undefined,
		activeConsumables = [];

	dispatch.hook('S_LOGIN', 10, (event) => {
		gameId = event.gameId;
		activeConsumables = [];
	});

/*
	Abnormalities are removed and re-applied every time the player enters a dungeon, teleports, switch channels.
	To prevent misleading messages from being sent the module keeps track of consumables' remaining duration.
*/
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, UpdateConsumables);
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, UpdateConsumables);

	function UpdateConsumables(event) {
		if (!event.target.equals(gameId)) return;

		let abnormality = activeConsumables.find(p => p.id == event.id);
		if (Consumables[event.id]) {
			event.startTime = Date.now();
			if (abnormality) { 
				abnormality.startTime = event.startTime; 
				abnormality.duration = event.duration; 
			} else { 
				activeConsumables.push(event);
			}
		}
	}

	dispatch.hook('S_ABNORMALITY_END', 1, (event) => {
		if (!event.target.equals(gameId)) return;

		let abnormality = activeConsumables.find(p => p.id == event.id);
		if (abnormality && Date.now() > abnormality.startTime + abnormality.duration - 1000) {
			sendMessage(Consumables[event.id] + ' 已过期!');
			activeConsumables = activeConsumables.filter(p => p.id != event.id);
		}
	})

	function sendMessage(msg) {
		dispatch.toClient('S_CHAT', 2, {
			channel: 7, 
			authorName: "注意",
			message: msg
		});

		dispatch.toClient('S_DUNGEON_EVENT_MESSAGE', 2, {
			type: 31, // 42 Blue Shiny Text, 31 Normal Text
			chat: false, 
			channel: 27, 
			message: msg
		});         
	}

}
