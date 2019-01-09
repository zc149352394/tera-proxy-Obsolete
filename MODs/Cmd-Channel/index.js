String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }

module.exports = function CmdChannel(d) {

	let currentChannel = 0

	d.command.add('c', (arg) => {
		if (!isNaN(arg))
			changeChannel(arg)
		else if (arg == 'n' || arg == null)
			changeChannel(currentChannel.channel+1)
		else if (arg == 'b')
			changeChannel(currentChannel.channel-1)
		else 
			send('无效的参数'.clr('FF0000'))
	})

	d.hook('S_CURRENT_CHANNEL', 2, (e) => {
		currentChannel = e
	})

	function changeChannel(newChannel) {
		if (currentChannel.channel > 20) return
		if (newChannel == 0) newChannel = 10
		if (newChannel == currentChannel.channel) {
			send('你已在此分流中!!'.clr('FF0000'))
			return
		}
		send('切换 ' + `频道${newChannel}`.clr('00FFFF'))
		--newChannel
		d.toServer('C_SELECT_CHANNEL', 1, {
			unk: 1,
			zone: currentChannel.zone,
			channel: newChannel
		})
	}

	function send(msg) {
		d.command.message(msg)
	}

}
