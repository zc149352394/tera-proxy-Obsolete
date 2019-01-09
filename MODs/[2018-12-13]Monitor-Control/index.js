const abnormality = [
	48732, "刨冰",
	70251, "利卡諾勒啤酒",
	70252, "覆盆子酒",
	70253, "天蓮花酒",
	70254, "萊納式黑啤酒",
	70255, "塔克式蜂蜜南瓜酒",
	999001011, "矇眼 : 為了進行破西瓜遊戲遮住眼睛"
]

const crystal = [
	10306, "力量增加 VII [水晶]",
	10316, "力量增加 VII [水晶]",
	12001, "旋風擊 VII [合成水晶輔助效果]",
	12003, "準備反擊 VII [合成水晶輔助效果]",
	12120, "準備反擊 VII [合成水晶]",
	12130, "旋風擊 VII [合成水晶]",

	10906, "MP持續恢復 VII",
	10916, "MP持續恢復 VII",
	11006, "MP持續恢復 VII",
	11016, "MP持續恢復 VII"
]

module.exports = function MonitorControl(d) {

// block drunken screen abnomality
	d.hook('S_ABNORMALITY_BEGIN', 3, (event) => {
		if (abnormality.includes(event.id))
			return false
	})

// block crystal effect refresh
	d.hook('S_ABNORMALITY_REFRESH', 1, (event) => {
		if (crystal.includes(event.id))
			return false
	})

// block screen zoom scripts
	d.hook('S_START_ACTION_SCRIPT', 3, () => {
		return false
	})

}
