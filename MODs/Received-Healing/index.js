module.exports = function noHealingReceivedNumbers(dispatch) {

	let gameId;

	dispatch.hook('S_LOGIN', 10, (event) => {
		gameId = event.gameId;
	})

	dispatch.hook('S_EACH_SKILL_RESULT', 12, (event) => {
		if (event.target.equals(gameId) && event.type === 2) {
			event.type = 0;
			return true;
		}
	})

}