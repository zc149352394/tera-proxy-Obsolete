String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function FindItemID(d) {

	let enabled = config.enabled,
		itemID

	d.command.add('fid', () => {
		enabled = !enabled
		send('显示物品itemID ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
	})

	d.hook('S_SHOW_ITEM_TOOLTIP', 9, sShowItemTooltip)

	function sShowItemTooltip(event) {
		if (!enabled) return
		itemID = event.dbid
		send('物品itemID ' + `${itemID}`.clr('00FFFF'))
		console.log('物品itemID ' + itemID)
	}

	function send(msg) {
		d.command.message(msg)
	}

}