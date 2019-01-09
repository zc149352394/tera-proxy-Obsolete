module.exports = function RemoveIdles(dispatch) {

	dispatch.hook('S_SOCIAL', 1, sSocial)

	function sSocial(event) {
		if ([31,32,33].includes(event.animation))
			return false
	}

}
