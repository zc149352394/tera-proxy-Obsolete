String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function FallDamage(d) {

	let enabled = config.enabled,
		currZone

	d.command.add('fd', () => {
		enabled = !enabled
		d.command.message('坠落伤害 ' + (enabled ? '移除'.clr('56B4E9') : '恢复'.clr('E69F00')))
	})

	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('C_PLAYER_LOCATION', 5, cPlayerLocation)

	function sLoadTopo(e) {
		currZone = e.zone
	}

	function cPlayerLocation(e) {
		if (!enabled) {
			return
		}
		if ([2, 10].includes(e.type) && (currZone < 10 || currZone > 200)) {
			if (enabled) {
				return false
			}
		}
	}

}
