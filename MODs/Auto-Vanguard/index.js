String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function AutoVanguard(d) {

	let	enabled = config.enabled,
		jobDisable = config.jobDisable,
		job = config.job,
		hold = config.hold,
		battleground = config.battleground

	let	questId = 0

	d.command.add('av', () => {
		enabled = !enabled
		d.command.message('自动领取H奖励 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
	})

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, sCompleteEventMatchingQuest)

	// code
	// disable module for specified job/class in config
	// useful for when accumulating item xp on alternative gear
	// if jobDisable is on, toggle according to configured class
	function sLogin(event) {
		if (!jobDisable) return
		(((event.templateId - 10101) % 100) !== job) ? enabled = true : enabled = false
	}

	// if in battleground, hold completion until open world
	// else check if there is a quest to complete
	function sLoadTopo(event) {
		if (battleground.includes(event.zone)) {
			hold = true
		} else if (hold && questId !== 0) {
			completeQuest()
			hold = false
		}
	}

	// if not in battleground, complete vanguard quest
	// otherwise, hold questId for later completion
	function sCompleteEventMatchingQuest(event) {
		if (!enabled) return
		questId = event.id
		if (!hold) completeQuest()
		return false
	}

	// helper
	// rudimentary attempt to complete both extra events
	// technically, sends unnecessary packets every vanguard completion
	function completeQuest() {
		d.toServer('C_COMPLETE_DAILY_EVENT', 1, { id: questId })
		try {
			setTimeout(() => { d.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 }) }, 500)
			setTimeout(() => { d.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 }) }, 500)
		} catch (e) {
			// do nothing
		}
		questId = 0
	}

}
