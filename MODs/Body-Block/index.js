module.exports = function BodyBlock(d) {

	const partyMembers = new Set()
	const cache = Object.create(null)
	const partyObj = Object.create(null)

	let interval = null

	partyObj.unk4 = 1

	const removeBodyBlock = () => {
		for (let i = partyMembers.values(), step; !(step = i.next()).done; ) {
			partyObj.leader = step.value
			partyObj.unk1   = cache.unk1
			partyObj.unk2   = cache.unk2
			partyObj.unk3   = cache.unk3
			d.send('S_PARTY_INFO', 1, partyObj)
		}
	}

	d.game.on('enter_game', () => {
		interval = setInterval(removeBodyBlock, 5000)
	})

	d.hook('S_PARTY_INFO', 1, sPartyInfo)
	d.hook('S_PARTY_MEMBER_LIST', 7, sPartyMemberList)

	function sPartyInfo(event) {
		Object.assign(cache, event);
	}

	function sPartyMemberList(event) {
		partyMembers.clear()
		for (let i = 0, arr = event.members, len = arr.length; i < len; ++i) {
			const member = arr[i]
			if (!member.online) continue
			partyMembers.add(member.gameId)
		}
	}

}
