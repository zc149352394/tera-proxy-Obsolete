String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config')

module.exports = function Autotrash(mod) {

	let gameId = null,
		myLocation = null,
		inventory = [],
		autotrash = config.auto,
		trashlist = config.trash

	mod.command.add('at', (arg0, arg1) => {
		let msg = null

		switch (arg0) {
			default:
				Autotrash() 
				msg = '已删除背包中的垃圾物品'.clr('FF0000')
				break
			case 'a':
			case 'auto':
				autotrash = !autotrash
				if(autotrash) Autotrash()
				msg = '设定删除背包垃圾道具为 ' + (autotrash ? '自动'.clr('56B4E9') : '手动'.clr('E69F00'))
				break
			case 'l':
			case 'list': // prints out a list of all items in trash list
				msg = '查询垃圾物品itemID: \n' + `${trashlist.toString()}`.clr('00FFFF')
				break
			case 'h':
			case 'help': // shows list of commands and their description
				msg = '控制命令: \n\t'
					+ "at \t\t- 删除背包中的垃圾物品 \n"
					+ "at auto \t\t- 自动删除垃圾道具 \n"
					+ "at help \t\t- 查询删除的垃圾物品itemID表 \n"
				break
		}
		mod.command.message(msg)
	})

	mod.hook('S_LOGIN', 10, event => { ({gameId} = event) })
	mod.hook('S_SPAWN_ME', 3, event => { myLocation = event })
	mod.hook('C_PLAYER_LOCATION', 5, event => { myLocation = event })

	mod.hook('C_SHOW_INVEN', 1, event => {if (autotrash) Autotrash()})
		
	mod.hook('S_SYSTEM_MESSAGE_LOOT_ITEM', 1, event => {
			if (autotrash && trashlist.includes(event.item))
				Autotrash()
		})

	function deleteItem(slot, amount) {
		mod.send('C_DEL_ITEM', 2, {
			gameId,
			slot: slot - 40,
			amount
		})
	}

	function Autotrash() {
		let invenHook = mod.hook('S_INVEN', 16, event => {
			inventory = inventory.concat(event.items)

			if (!event.more) {
				for (let item of inventory) {
					if (item.slot < 40) continue
					else if (trashlist.includes(item.id))
						deleteItem(item.slot, item.amount)
				}
			}
			inventory = []
			mod.unhook(invenHook)
		})
	}
}
