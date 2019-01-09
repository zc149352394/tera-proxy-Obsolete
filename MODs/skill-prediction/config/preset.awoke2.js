/*
Note: If you can't find a specific skill on these list that probably means the preset file is outdated. 
To update it just delete it and restart proxy, let it update and it will be done.
If after following this process skills are still missing do report it on discord or an issue in github, links to both can be found in the readme.pdf file.
*/
/* eslint-disable quotes */

module.exports = {
	0: { // Warrior
		"enabled": true,
		1: true, // Combo Attack
		2: true, // Evasive Roll
		3: true, // Torrent of Blows
		4: true, // Rain of Blows
		5: true, // Battle Cry
		8: true, // Assault Stance
		9: true, // Defensive Stance
		10: true, // Death From Above
		11: true, // Poison Blade
		12: true, // Leaping Strike
		13: false, // Retaliate
		16: true, // Charging Slash
		17: true, // Vortex Slash
		18: true, // Combative Strike
		19: true, // Rising Fury
		20: true, // Deadly Gamble
		21: true, // Cascade of Stuns
		23: true, // Spinning Counter
		24: true, // Smoke Aggressor
		25: true, // Command: Attack
		26: true, // Command: Follow
		28: true, // Traverse Cut
		29: true, // Blade Draw
		30: true, // Scythe
		31: true, // Reaping Slash
		32: true, // Cross Parry
		34: true, // Binding Sword
		35: true, // Infuriate
		36: true, // Rain of Blows (Deadly Gamble)
		37: true, // Blade Draw (Deadly Gamble)
		38: true, // Scythe (Deadly Gamble)
		39: true, // Traverse Cut (Defensive Stance)
		// Awakening
		40: true, // Blade Waltz
		41: true, // Aerial Scythe
		42: true, // Blade Frenzy
		910: true, // Apex Urgency
 	},
	1: { // Lancer
		"enabled": true,
		1: true, // Combo Attack
		2: true, // Stand Fast
		3: true, // Onslaught
		4: true, // Challenging Shout
		5: true, // Shield Bash
		7: true, // Guardian Shout
		8: true, // Shield Counter
		9: true, // Leash
		10: true, // Debilitate
		11: false, // Retaliate
		12: true, // Infuriate
		13: true, // Spring Attack
		15: true, // Charging Lunge
		16: true, // Second Wind
		17: true, // Adrenaline Rush
		18: true, // Shield Barrage
		19: true, // Pledge of Protection
		21: true, // Lockdown Blow
		22: true, // Iron Will
		23: true, // Master's Leash
		24: true, // Chained Leash
		25: true, // Wallop
		26: true, // Backstep
		27: true, // Rallying Cry
		// Awakening
		28: false, // Super Leap
		29: true, // Guardian's Barrier
		30: true, // Divine Protection
		910: true, // Apex Urgency 
	},
	2: { // Slayer
		"enabled": true,
		1: true, // Combo Attack
		2: true, // Knockdown Strike
		3: true, // Whirlwind
		4: true, // Evasive Roll
		5: true, // Dash
		8: true, // Overhand Strike
		9: true, // Leaping Strike
		10: false, // Retaliate
		12: true, // Heart Thrust
		13: true, // Stunning Backhand
		14: true, // Distant Blade
		15: true, // Startling Kick
		16: true, // Fury Strike
		17: false, // Headlong Rush / Not properly emulated, use at the expense of possible issues.
		18: true, // Overpower
		19: true, // Tenacity
		20: true, // In Cold Blood
		21: true, // Exhausting Blow
		23: true, // Measured Slice
		24: true, // Eviscerate
		25: true, // Ultimate Overhand Strike
		// Awakening
		26: true, // Punishing Blow
		27: true, // Savage Strike
		28: true, // Unsheathe
		910: true, // Apex Urgency
	},
	3: { // Berserker
		"enabled": true,
		1: true, // Combo Attack
		2: true, // Axe Block
		3: true, // Thunderstrike
		4: true, // Flatten
		5: true, // Dash
		6: true, // Sweeping Strike
		8: true, // Fiery Rage
		10: true, // Cyclone
		11: true, // Leaping Strike
		13: false, // Retaliate
		15: true, // Vampiric Blow (unstable emulation, enable it only if your ping >180)
		16: true, // Fearsome Shout / Normie Odium Cry (Unleash)
		18: true, // Lethal Strike
		19: true, // Triumphant Shout
		20: true, // Inescapable Doom
		21: true, // Bloodlust
		24: true, // Evasive Smash
		25: true, // Raze
		26: true, // Tackle
		27: true, // Unbreakable
		28: true, // Intimidation
		29: true, // Evasive Roll
		30: true, // Axe Counter
		31: true, // Overwhelm
		32: true, // Punishing Strike
		// Awakening
		33: true, // Unleash
		34: true, // Unleash: Dexter
		35: true, // Unleash: Sinister
		36: true, // Unleash: Rampage
		37: true, // Unleash: Beast Fury
		910: true, // Apex Urgency
	},
	4: { // Sorcerer
		"enabled": true,
		1: true, // Fireball
		2: true, // Frost Sphere
		3: true, // Lightning Trap
		4: true, // Arcane Pulse
		5: true, // Mana Infusion
		6: true, // Meteor Strike
		7: true, // Backstep
		8: true, // Flame Pillar
		10: true, // Mana Barrier
		11: true, // Lightning Strike
		12: true, // Void Pulse
		13: true, // Mindblast
		14: false, // Retaliate
		16: true, // Painblast
		17: true, // Painful Trap
		18: true, // Glacial Retreat
		19: true, // Mana Siphon
		20: true, // Flaming Barrage
		21: true, // Nerve Exhaustion
		22: true, // Burning Breath
		23: true, // Mana Volley
		25: true, // Time Gyre
		26: true, // Teleport Jaunt
		27: true, // Hailstorm
		28: false, //Stone Skin
		30: true, // Nova
		31: true, // Warp Barrier
		32: true, // Meteor Shower
		33: true, // Arcane Pulse (Mana Boost)
		34: true, // Mana Boost
		// Awakening
		35: false, // Ice Lance
		36: true, // Fusion
		39: true, // Implosion
		41: true, // Lightning Strike ??
		910: true, // Apex Urgency
	},
	5: { // Archer
		"enabled": true,
		1: true, // Arrow
		2: true, // Arrow Volley
		3: true, // Radiant Arrow
		4: true, // Penetrating Arrow
		5: true, // Rain of Arrows
		6: true, // Backstep
		7: true, // Feign Death
		8: true, // Rapid Fire
		9: true, // Slow Trap
		10: true, // Stunning Trap
		12: true, // Velik's Mark
		14: true, // Retaliate
		15: true, // Incendiary Trap
		16: true, // Breakaway Bolt
		17: true, // Web Arrow
		18: true, // Close Quarters
		19: true, // Poison Arrow
		20: true, // Restraining Arrow
		21: true, // Sniper's Eye
		22: true, // Sequential Fire
		23: true, // Stunning Trap Arrow
		25: true, // Incendiary Trap Arrow
		29: true, // Thunderbolt
		31: true, // Tenacity
		32: true, // Find Weakness
		33: true, // Chase
		// Awakening
		35: true, // Windsong
		36: true, // Gust Arrow
		910: true, // Apex Urgency
	},
	6: { // Priest
		"enabled": true,
		1: true, // Divine Radiance
		2: true, // Regeneration Circle
		3: true, // Healing Circle
		5: true, // Blessing of Shakan
		6: true, // Arise
		8: true, // Mana Infusion
		10: true, // Purifying Circle
		11: true, // Metamorphic Blast
		12: true, // Resurrect
		14: true, // Summon: Party
		16: true, // Shocking Implosion
		17: true, // Prayer of Peace
		18: true, // Heal Thyself
		19: true, // Focus Heal
		22: true, // Kaia's Shield
		23: true, // Blessing of Balder
		25: false, // Retaliate
		26: true, // Fiery Escape
		27: true, // Final Reprisal
		28: true, // Mana Charge / Divine Charge (Awakening)
		29: true, // Triple Nemesis
		30: true, // Plague of Exhaustion
		31: true, // Guardian Sanctuary
		32: true, // Divine Respite
		33: true, // Ishara's Lullaby
		34: true, // Restorative Burst
		35: true, // Energy Stars
		37: true, // Healing Immersion
		38: true, // Backstep
		39: true, // Grace of Resurrection
		40: true, // Zenobia's Vortex
		41: true, // Divine Intervention / Divine Vitality (Awakening)
		// Awakening
		42: true, // Holy Burst
		43: true, // Edict of Judgement
		910: true, // Apex Urgency
	},
	7: { // Mystic
		"enabled": true,
		1: true, // Sharan Bolt
		2: true, // Corruption Ring
		4: true, // Ancient Binding
		5: true, // Titanic Favor
		6: true, // Shara's Lash
		7: true, // Mana Infusion
		8: true, // Metamorphic Blast
		9: true, // Arun's Cleansing
		10: true, // Resurrect
		11: true, // Summon: Party
		12: true, // Vow of Rebirth
		13: true, // Aura of the Merciless
		14: true, // Aura of the Swift
		15: true, // Aura of the Unyielding
		16: true, // Aura of the Tenacious
		17: true, // Teleport Jaunt
		18: true, // Arun's Vitae
		21: false, // Retaliate
		22: true, // Arun's Tears
		23: true, // Metamorphic Smite
		24: true, // Volley of Curses
		25: true, // Thrall of Protection
		27: true, // Thrall of Life
		28: true, // Sonorous Dreams
		29: true, // Regression
		30: true, // Curse of Exhaustion
		31: true, // Curse of Confusion
		32: true, // Mire
		33: true, // Thrall of Vengeance
		34: true, // Thrall of Wrath
		35: true, // Command: Attack
		36: true, // Command: Follow
		37: true, // Warding Totem
		41: true, // Contagion
		42: true, // Boomerang Pulse
		43: true, // Release
		// Awakening
		44: true, // Mass Teleport
		45: true, // Thrall Augmentation
		47: true, // Arunic Release
		48: true, // Summon: Thrall Lord
		910: true, // Apex Urgency
	},
	10: { // Brawler
		"enabled": true,
		1: true, // Punch
		2: true, // Counter
		4: true, // Ground Pound
		5: true, // Bullrush
		6: true, // Haymaker
		7: true, // Roundhouse Kick
		8: true, // Piledriver
		9: true, // Jackhammer
		10: true, // Counterpunch
		12: false, // Retaliate
		13: true, // Provoke
		14: true, // Infuriate
		16: true, // Flip Kick
		18: true, // Growing Fury
		19: true, // Invigorating Rage
		21: true, // Mounting Rage
		40: true, // Quick Dash
		// Awakening
		22: true, // Flying Kick
		24: true, // 2.54cm Punch
		26: true, // Brawling Roll
		910: true, // Apex Urgency
	},
};
