
const utils = require("./utils");
const EventEmitter = require("events").EventEmitter;
/**
 * @description A bit weird module with all SP data
 * @class Data
 */
class State extends EventEmitter {
	constructor() {
		super();
		Object.assign(this, {
			config: {},
			defaultConfig: {},
			preset: {},
			skills: {},
			blacklist: {},
			globalNoInterrupts: {},
			blockedAbnormals: {},
			basicCC: {},
			extendedCC: {},
			evasiveCC: {},
			blacklistPath: utils.getFullPath("../config/data/blacklist.json"),
			configPath: utils.getFullPath("../config/config.json"),
			presetKrPath: utils.getFullPath("../config/preset.kr.js"),
			presetAwokeTwo: utils.getFullPath("../config/preset.awoke2.js"),
			defaultConfigPath: utils.getFullPath("../config/data/default-config.json"),
			skillsKrPath: utils.getFullPath("../config/data/skills.kr.js"),
			skillsAwokeTwo: utils.getFullPath("../config/data/skills.awoke2.js"),
			ccPath: utils.getFullPath("../config/data/cc.json"),
			blockedAbnormalsPath: utils.getFullPath("../config/data/abnormalities.js"),
			ChargeDelayConst: 40,
			zCorrectionDiff: 70,
			XYCorrectionDiff: 100,
			hookFake: {
				order: -201,
				filter: {
					fake: null
				}
			},
			hookFakeNotFirst: {order: 15, filter: {fake: null}}
		});

		this.ReloadAll();
	}

	/**
	 * @description Enable/Disable SP method with event fire
	 * @memberof State
	 */
	SwitchEnableStateWithEvent() {
		this.config.enabled = !this.config.enabled;
		this.emit("stateChanged", this.config.enabled);
	}

	/**
	 * @description reload all data method DO NOT USE IT MANUALLY
	 * @memberof State
	 */
	ReloadAll() {
		//load user config
		this.config = utils.loadJson(this.configPath);

		//config check
		if (this.config.skillRetryCount > 3) {
			utils.writeWarningMessage(`skillRetryCount=${this.config.skillRetryCount} not allowed! skillRetryCount=1.`);
			this.config.skillRetryCount = 1;
		}
		if (this.config.skillRetryMs < 20) {
			utils.writeWarningMessage(`skillRetryMs=${this.config.skillRetryMs} not allowed! skillRetryMs=25.`);
			this.config.skillRetryMs = 25;
		}

		this.defaultConfig = utils.loadJson(this.defaultConfigPath);
		this.blacklist = utils.getMapFromArray((utils.loadJson(this.blacklistPath))["skills"]);
		this.globalNoInterrupts = utils.getMapFromArray((utils.loadJson(this.blacklistPath))["noInterrupt"]);
		
		//load cc file
		let ccFile = utils.loadJson(this.ccPath);
		//split them by groups
		
		this.basicCC = (utils.getMapFromArray(ccFile["basic"]));
		this.extendedCC= (utils.getMapFromArray(ccFile["extended"]));
		this.evasiveCC= (utils.getMapFromArray(ccFile["evasive"]));
		ccFile = null;

	}

	/**
	 * @description ONLY FOR DEVS
	 * @memberof State
	 */
	ReloadSkills() {
		delete require.cache[require.resolve(this.skillsPath)];
		this.skills = require(this.skillsPath);
	}

	/**
	 * @description ONLY FOR DEVS
	 * @memberof State
	 */
	ReloadSkillsPreset() {
		delete require.cache[require.resolve(this.presetPath)];
		this.preset = require(this.presetPath);
	}
	/**
	 * @description reload configuration method
	 * @memberof State
	 */
	ReloadConfig() {
		this.config = utils.loadJson(this.configPath);
	}

	/**
	 * @description ONLY FOR DEVS
	 * @memberof State
	 */
	CleanCcLists() {
		this.basicCC = {};
		this.evasiveCC = {};
		this.extendedCC = {};
	}

	LoadSkillsByPatch(mod) {
		if(mod.majorPatchVersion >= 77) {
			this.preset = require(this.presetKrPath);
			this.skills = require(this.skillsKrPath);
			if(!this.preset[4][4] || !this.preset[4][33]){
				this.preset[4][4] = false;
				this.preset[4][33] = false;
			}
		}
		else
		{
			this.preset = require(this.presetAwokeTwo);
			this.skills = require(this.skillsAwokeTwo);
			if(!this.preset[4][4] || !this.preset[4][33]){
				this.preset[4][4] = false;
				this.preset[4][33] = false;
			}
		}

		//------start of nightmare-------
		this.blockedAbnormals = require(this.blockedAbnormalsPath);
		let found = [];
		for (let id of Object.keys(this.skills)) {
			let classObject = this.skills[id];

			let supportedSkills = Object.keys(classObject);
			for (let skillId of supportedSkills) {
				if (!this.preset[id]["enabled"]) continue;
				if (this.preset[id][skillId]) {
					found.push(utils.getDataFromObjectByField(classObject[skillId], "triggerAbnormal"));
				}
			}
		}
		Object.assign(this.blockedAbnormals, utils.getMapFromArray(utils.getFlatArray(found)));
		//GC our hero! Maybe...
		found = null;
		//------the end of nightmare-------
	}
	/**
	 * @description save config method
	 * @memberof State
	 */
	SaveConfig() {
		utils.saveJson(this.config, this.configPath);
	}

	/**
	 * @description reset config with default values
	 * @memberof State
	 */
	ResetConfig() {
		this.config = Object.assign({}, this.defaultConfig);
	}
}

module.exports = new State();