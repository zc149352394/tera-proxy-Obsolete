// beng beng go fuck yourself pinkie
module.exports = function Soulbind(dispatch) {

	dispatch.hook('C_BIND_ITEM_BEGIN_PROGRESS', 1, event => {
		dispatch.toServer('C_BIND_ITEM_EXECUTE', 1, { contractId: event.contractId })
		process.nextTick(() => {
			dispatch.toClient('S_CANCEL_CONTRACT', 1, {
				type: 32,
				id: event.contractId
			})
		})
	})
	dispatch.hook('C_BIND_ITEM_EXECUTE', 'raw', () => false)
}
