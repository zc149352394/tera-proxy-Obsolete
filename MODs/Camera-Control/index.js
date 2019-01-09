String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

module.exports = function CameraControl(d) {

	let enabled = config.enabled,
		setDistance = config.defaultDistance

	d.command.add('cam', (arg) => {
		if (!arg) {
			enabled = !enabled
			send('自定义视距 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')))
			if (!enabled) {
				setCamera(500)
			}
		} else if (!isNaN(arg)) {
			setDistance = arg
			setCamera(setDistance)
			send('调整视距为 ' + `${setDistance}`.clr('00FFFF'))
		} else send('无效的参数'.clr('FF0000'))
	})

	d.hook('S_SPAWN_ME', 3, sSpawnMe)

	function sSpawnMe() {
		if (enabled) setTimeout(() => { 
			setCamera(setDistance)
		}, 3000)
	}

	function setCamera(arg) {
		d.toClient('S_DUNGEON_CAMERA_SET', 1, {
			enabled: true,
			default: arg,
			max: arg
		})
	}

	function send(msg) {
		d.command.message(msg)
	}

}
