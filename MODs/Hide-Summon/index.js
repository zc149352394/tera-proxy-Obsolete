String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function HideSummon(d) {

	let enabled = config.enabled,
		Summon_IDs = config.Summon_IDs,
		HuntingZone_ID = 1023

	d.command.add(['hidesummon', 'hs'], () => {
		enabled = !enabled
		d.command.message('召唤生物 ' + (enabled ? '移除'.clr('56B4E9') : '恢复'.clr('E69F00')))
	})

	d.hook('S_SPAWN_NPC', 9, sSpawnNpc)

	function sSpawnNpc(event) {
		if (Summon_IDs.includes(event.templateId) && event.huntingZoneId == HuntingZone_ID) {
			if (enabled) return false
		}
	}

}
