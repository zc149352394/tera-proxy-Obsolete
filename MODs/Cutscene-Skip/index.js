String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function CutsceneSkip(d) {

	let enabled = config.enabled

	d.command.add('cs', () => {
		enabled = !enabled
		send('剧情动画 ' + (enabled ? '跳过'.clr('56B4E9') : '恢复'.clr('E69F00')))
	})

	d.hook('S_PLAY_MOVIE', 1, sPlayMovie)

	function sPlayMovie(e) {
		if (!enabled) return
		d.toServer('C_END_MOVIE', 1, Object.assign({ unk : 1 }, e))
		return false
	}

	function send(msg) {
		d.command.message(msg)
	}

}
