module.exports = function InstantEnchant(mod) {
	let enchanting = null

	for(const method of ['ENCHANT', 'UPGRADE']) {
		mod.hook('C_REGISTER_' + method + '_ITEM', 1, event => { enchanting = event })

		mod.hook('C_START_' + method, 1, event => {
			if(enchanting && event.contract === enchanting.contract) {
				mod.send('C_REQUEST_' + method, 1, enchanting)
				return false
			}
		})

		mod.hook('C_REQUEST_' + method, 'raw', () => false)
	}
}
