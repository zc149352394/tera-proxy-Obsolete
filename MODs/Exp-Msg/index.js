String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function ExpMsg(d) {
	let enabled = config.enabled,
		expDifference,
		exp,
		level,
		totalPoints,
		dailyExp,
		dailyExpMax,
		baseRev,
		tsRev

	d.hook('S_PLAYER_CHANGE_EP', 1, sPlayerChangeEp)

	function sPlayerChangeEp(event) {
		//console.log(event)
		expDifference = event.expDifference
		exp = event.exp
		level = event.level
		totalPoints = event.totalPoints
		dailyExp = event.dailyExp
		dailyExpMax = event.dailyExpMax
		baseRev = event.baseRev,
		tsRev = event.tsRev

		if (!enabled) return

		expStatus()

		if (event.levelUp) {
			d.command.message('特性系统信息 ' + '等级提升!'.clr('FF0000'))
		}
	}

	function expStatus() {
		send(`特性总经验 ` + `${exp}`.clr('A0A0A0') + ` | 获得经验 ` + `+${expDifference}`.clr('56B4E9'))
	}

	function status() {
		send(`特性系统 详细信息:`,
			`特性经验 ` + `${exp}`.clr('A0A0A0'),
			`获得经验 ` + `+${expDifference}`.clr('56B4E9'),
			`特性等级 : ` + `${level}`.clr('00FFFF'),
			`点数总量 : ` + `${totalPoints}`.clr('00FFFF'),
			`dailyExp : ` + `${dailyExp}`.clr('56B4E9'),
			`dailyExpMax : ` + `${dailyExpMax}`.clr('E69F00'),
			`baseRev : ` + `${baseRev}`.clr('A0A0A0'),
			`tsRev : ` + `${tsRev}`.clr('A0A0A0')
		)
	}

	function send(msg) {
		d.command.message([...arguments].join('\n\t - '.clr('FFFFFF')))
	}

	d.command.add(['exp', 'ep', 'em'], (arg) => {
		if (!arg) {
			enabled = !enabled
			d.command.message('特性系统信息 ' + (enabled ? '显示'.clr('56B4E9') : '隐藏'.clr('E69F00')))
		} else if (arg === 's' || arg === 'status') {
			status()
		} else {
			send('无效的参数'.clr('FF0000'))
		}
	})
}
