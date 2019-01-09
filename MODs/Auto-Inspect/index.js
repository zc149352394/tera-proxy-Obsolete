module.exports = function AutoInspect(d) {

	d.hook('S_ANSWER_INTERACTIVE', 2, sAnswerInteractive)

	function sAnswerInteractive(event) {
		d.toServer('C_REQUEST_USER_PAPERDOLL_INFO', 1, {
			name: event.name
		})
	}

}
