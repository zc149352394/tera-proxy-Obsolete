String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
const config = require('./config.json')

const COORDS = [
	{x:-7364,y:-83180,z:1},		// Front (head)
	{x:-8946,y:-84887,z:1},		// Right-Back leg
	{x:-8686,y:-85301,z:1},		// Right-Back leg 2
	{x:-8620,y:-83531,z:1},		// Right-Front leg
	{x:-6667,y:-85440,z:1},		// Left-Back leg
	{x:-7403,y:-85814,z:1},		// Left-Back leg 2
	{x:-6411,y:-84057,z:1},		// Left-Front leg
	{x:-6353,y:-84872,z:1},		// Left-Middle
	{x:-8908,y:-84001,z:1}]		// Right-Middle

module.exports = function HHP4Marker(d) {

	let enabled = config.enabled,
		MARKER = config.marker,
		HARROWHOLD = config.harrowhold,

		inDung = false,
		uid = 999999999,
		markers = []

	d.command.add('hhm', () => {
		if (enabled) {
			enabled = false
			ClearSpawns()
			d.command.message('安全区标记' + '启用'.clr('56B4E9'))
		} else if (!enabled) {
			enabled = true
			SpawnMarkers()
			d.command.message('安全区标记' + '禁用'.clr('E69F00'))
		} else {
			d.command.message('无效的参数'.clr('FF0000'))
		}
	})

	d.hook('S_LOAD_TOPO', 3, sLoadTopo)
	d.hook('C_LOAD_TOPO_FIN', 1, cLoadTopoFin)

	function sLoadTopo(event) {
		ClearSpawns()
		if (event.zone == HARROWHOLD) {
			inDung = true
		}
	}

	function cLoadTopoFin(event) {
		if (enabled) {
			SpawnMarkers()
		}
	}

	function SpawnMarkers() {
		if (inDung) {
			for (let i in COORDS) {
				SpawnThing(COORDS[i],MARKER)
			}
		}
	}

	function ClearSpawns() {
		if (markers) {
			for (let i in markers) {
				Despawn(markers[i]);
			}
			markers = [];
		}
	}

	function SpawnThing(position,item) {
		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid,
			id : item,
			amount : 1,
			loc : position,
			angle: Math.PI,
			extractor : 0,
			extractorDisabled : 0,
			extractorDisabledTime : 0
		});
		markers.push(uid);
		uid--;
	}

	function Despawn(uid) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid
		});
	}

}
