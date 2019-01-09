module.exports = {
	FirstBossActions: {							// 1王攻击动作
		106: {msg: '重击'},
		107: {msg: '后喷(击退)'},
		108: {msg: '点名(击飞)'},
		109: {msg: '滚石'},
		110: {msg: '滚石'},
		301: {msg: '食人花(眩晕)'},
		307: {msg: '笼子(禁锢)'},
		309: {msg: '1朵花-鉴定!!'},
		310: {msg: '2朵花-鉴定!!'},
		116: {msg: '全屏攻击!!'},
		312: {msg: '金色花!!'}
	},
	SecondBossActions: {						// 2王攻击动作
		105: {msg: '翻滚'},
		113: {msg: '双手(眩晕)'},
		114: {msg: '三连地板(靠近)'},
		116: {msg: '(前砸) (后砸)'},
		301: {msg: '↓ 捶地(远离) | 旋转(击退)'},
		302: {msg: '↑ 旋转(靠近) | 捶地(击飞)'}
	},
	ThirdBossActions: {							// 3王攻击动作
		118: {msg: '三连击(左-右-喷)'},
		143: {msg: '←← 左后 ←←'},
		145: {msg: '←← 左后 ←←'},
		146: {msg: '←← 左后 (扩散)', sign_degrees: 325, sign_distance: 370},
		154: {msg: '←← 左后 (扩散)', sign_degrees: 325, sign_distance: 370},
		144: {msg: '→→ 右后 →→'},
		147: {msg: '→→ 右后 →→'},
		148: {msg: '→→ 右后 (扩散)', sign_degrees: 25, sign_distance: 388},
		155: {msg: '→→ 右后 (扩散)', sign_degrees: 25, sign_distance: 388},
		161: {msg: '(后砸) (前砸)'},
		162: {msg: '(后砸) (前砸)'},
		213: {msg: '尾巴'},
		215: {msg: '尾巴'},

		139: {msg: '顺时针 (摆头) 王打→右边', sign_degrees: 270, sign_distance: 200}, //151
		150: {msg: '顺时针 (落地) 王打→右边', sign_degrees: 270, sign_distance: 200}, //151
		141: {msg: '逆时针 (摆头) 王打←左边', sign_degrees: 90, sign_distance: 200}, //153
		152: {msg: '逆时针 (落地) 王打←左边', sign_degrees: 90, sign_distance: 200}, //153

		300: {msg: '一次觉醒 (推人)', level_Msg: ['一层', '二层', '三层', '<font color="#FF0000">爆炸! 爆炸!</font>']},
		399: {msg: '二次觉醒 (推人)', level_Msg: ['一层', '<font color="#FF0000">爆炸! 爆炸!</font>']},
		360: {msg: '爆炸!!爆炸!!'}
	},
}
