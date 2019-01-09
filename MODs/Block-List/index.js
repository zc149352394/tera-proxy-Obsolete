String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

const path = require('path')
const fs = require('fs')

if (!fs.existsSync(path.join(__dirname, './data'))) {
	fs.mkdirSync(path.join(__dirname, './data'))
}

function getJsonData(pathToFile) {
	try {
		return JSON.parse(fs.readFileSync(path.join(__dirname, pathToFile)));
	} catch (e) {
		return undefined;
	}
}

function saveJsonData(pathToFile, data) {
	fs.writeFileSync(path.join(__dirname, pathToFile), JSON.stringify(data, null, "    "));
}

module.exports = function BlockList(d) {
	
	// config
	let autoSync = config.autoSync

	let data,
		playerBlockList = [],
		settingsPath = ''

	// command
	d.command.add('bl', (param) => {
		if (param === 'import') syncBlockList()
		else if (param === 'export') exportBlockList()
		//else if (param === 'test') { console.log(data); console.log(playerBlockList) }
		else send(`无效的参数`.clr('FF0000'))
	})

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_USER_BLOCK_LIST', 2, sUserBlockList)
	d.hook('S_LOAD_CLIENT_USER_SETTING', 1, sLoadClientUserSetting)
	d.hook('S_ADD_BLOCKED_USER', 2, sAddBlockedUser)
	d.hook('C_EDIT_BLOCKED_USER_MEMO', 1, { filter: { fake: null } }, cEditBlockedUserMemo)
	d.hook('C_REMOVE_BLOCKED_USER', 1, { filter: { fake: null } }, cRemoveBlockedUser)
	
	// code
	// empty current playerBlockList array
	// set file path
	function sLogin(e) {
		playerBlockList.length = 0
		settingsPath = `./data/${d.base.region}-${e.serverId}.json`
	}

	// id, level, class, name, myNote
	function sUserBlockList(e) {
		// log player block list in array
		for (let i = 0, n = e.blockList.length; i < n; i++) {
			let temp = {
				id: e.blockList[i].id,
				name: e.blockList[i].name,
				myNote: e.blockList[i].myNote
			}
			playerBlockList.push(temp)
		}
		//process.nextTick(() => { send(`test`)})
	}

	// TODO -- hook, not hookOnce .. may lead to errors and unwanted callbacks
	function sLoadClientUserSetting() {
		// autoSync check
		if (autoSync) {
			data = getJsonData(settingsPath)
			if (!data || data.length == 0) {
				data = []
				autoSync = false
				process.nextTick(() => {
					send(`封锁黑名单列表 不存在. 在设置 "autoSync" 参数为 "true" 以前, 确保先导出过 "bl export" 黑名单.`.clr('FF0000'))
				})
				//console.log(`Block list does not exist. make sure to "export" block list from characters before setting "autoSync" to "true".`)
			} else {
				send('自动同步功能 ' +  '已启用'.clr('56B4E9'))
				syncBlockList()
				process.nextTick(() => {
					send('封锁黑名单列表 ' + '已自动同步'.clr('56B4E9'))
				})
			}
		}
	}

	// id, name, myNote
	function sAddBlockedUser(e) {
		let found = false,
			temp = {
				id: e.id,
				name: e.name,
				myNote: e.myNote
			}
		// state 0
		if (!data || data.length == 0) {
			playerBlockList.push(temp)
			return
		}
		// find in database
		for (let i = 0, n = data.length; i < n; i++) {
			if (data[i].name == e.name) {
				found = true
				if (data[i].myNote !== e.myNote) {
					temp.myNote = data[i].myNote
					// does edit but does not appear on client until relog
					d.send('C_EDIT_BLOCKED_USER_MEMO', 1, { id: e.id, memo: temp.myNote })
				}
				break
			}
		}
		// autoSync -- add to database
		if (autoSync && !found) {
			let new_data = JSON.parse(`{ "id": ${temp.id}, "name": "${temp.name}", "myNote": "${temp.myNote}" }`)
			data.push(new_data)
			// save to database
			saveJsonData(settingsPath, data)
			send('同步封锁用户: ' + `"${temp.name}"`.clr('56B4E9'))
		}
		playerBlockList.push(temp)
	}

	// id, memo
	function cEditBlockedUserMemo(e) {
		// edit player block list
		for (let i = 0, n = playerBlockList.length; i < n; i++) {
			if (playerBlockList[i].id == e.id) {
				playerBlockList[i].myNote = e.memo
				break
			}
		}
		// state 0
		if (!data || data.length == 0) return
		// edit database if player exists
		if (autoSync) {
			for (let i = 0, n = data.length; i < n; i++) {
				if (data[i].id == e.id) {
					data[i].myNote = e.memo
					// save to database
					saveJsonData(settingsPath, data)
					send('同步封锁用户备注: ' + `"${data[i].name}"`.clr('56B4E9'))
					break
				}
			}
		}
	}

	// name
	function cRemoveBlockedUser(e) {
		// remove from player block list
		for (let i = 0, n = playerBlockList.length; i < n; i++) {
			if (playerBlockList[i].name == e.name) {
				playerBlockList.splice(i, 1)
				break
			}
		}
		// state 0
		if (!data || data.length == 0) return
		// autoSync -- remove from database
		if (autoSync) {
			for (let i = 0, n = data.length; i < n; i++) {
				if (data[i].name == e.name) {
					data.splice(i, 1)
					// save to database
					saveJsonData(settingsPath, data)
					send('同步移除用户封锁: ' + `"${e.name}"`.clr('56B4E9'))
					break
				}
			}
		}
	}

	// helper
	// autoSync
	function syncBlockList() {
		data = getJsonData(settingsPath)
		let found = false,
			// need separate arrays to avoid length error
			toBlock = [],
			toUnblock = []
		// state 0
		if (!data) {
			send(`封锁黑名单列表 不存在. 在设置 "autoSync" 参数为 "true" 以前, 确保先导出过 "bl export" 黑名单.`.clr('FF0000'))
			return
		}
		// find database player in player block list, else block
		for (let i = 0, n = data.length; i < n; i++) {
			found = false
			for (let j = 0, m = playerBlockList.length; j < m; j++) {
				if (data[i].name == playerBlockList[j].name) {
					found = true
					break
				}
			}
			if (!found) {
				toBlock.push(data[i].name)
			}
		}
		toBlock.forEach((playerName) => { d.send('C_BLOCK_USER', 1, { name: playerName }) })
		// find block list player in database, else unblock
		for (let i = 0, n = playerBlockList.length; i < n; i++) {
			found = false
			for (let j = 0, m = data.length; j < m; j++) {
				if (playerBlockList[i].name == data[j].name) {
					found = true
					break
				}
			}
			if (!found) {
				toUnblock.push(playerBlockList[i].name)
			}
		}
		toUnblock.forEach((playerName) => { d.send('C_REMOVE_BLOCKED_USER', 1, { name: playerName }) })
		send(`封锁黑名单列表 已自动同步. 请重新登录以同步封锁用户备忘录.`.clr('56B4E9'))
		//console.log(playerBlockList)
	}

	function exportBlockList() {
		let found = false
		if (!data || data.length == 0) data = []
		// find block list player in database, else add to database
		for (let i = 0, n = playerBlockList.length; i < n; i++) {
			found = false
			for (let j = 0, m = data.length; j < m; j++) {
				if (playerBlockList[i].name == data[j].name) {
					found = true
					break
				}
			}
			if (!found) {
				let new_data = JSON.parse(`{ "id": ${playerBlockList[i].id}, "name": "${playerBlockList[i].name}", "myNote": "${playerBlockList[i].myNote}" }`)
				data.push(new_data)
			}
		}
		saveJsonData(settingsPath, data)
		send(`来自当前角色的(被封锁的玩家ID)已经被导出到本地数据库.`.clr('E69F00'))
		//console.log(data)
	}

	function send(msg) {
		d.command.message(msg)
	}

}
