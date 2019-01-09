module.exports = [
////治疗锁定-队友
	{// 祭师-治癒之光
		group: 19,
		job: 6,
		type: 'heal',
		dist: 35,
		targets: 4 },
	{// 祭师-治癒翅膀
		group: 37,
		job: 6,
		type: 'heal',
		dist: 35,
		targets: 1 },
	{// 元素-恢復彈
		group: 5,
		job: 7,
		type: 'heal',
		dist: 35,
		targets: 4 },
////驱散锁定-队友
	{// 元素-淨化彈
		group: 9,
		job: 7,
		type: 'cleanse',
		dist: 35,
		targets: 4 },
////减益锁定-BOSS
	{// 祭师-乏力預言
		group: 30,
		job: 6,
		dist: 30,
		type: 'debuff' },
	{// 祭师-伊莎拉搖籃曲
		group: 33,
		job: 6,
		dist: 30,
		type: 'debuff' },
	{// 元素-痛苦咒縛
		group: 24,
		job: 7,
		dist: 30,
		type: 'debuff' },
	{// 元素-流沙束縛
		group: 28,
		job: 7,
		dist: 30,
		type: 'debuff' },
////增益锁定-BOSS
	{// 祭师-神聖閃電
		group: 35,
		job: 6,
		dist: 30,
		type: 'buff' },
////攻击锁定-BOSS
	{// 元素-疫病猖獗
		group: 41,
		job: 7,
		dist: 30,
		type: 'dps' },
	{// 弓箭-多重射擊
		group: 2,
		job: 5,
		dist: 35,
		type: 'dps' },
	{// 魔道-追蹤業火
		group: 20,
		job: 4,
		dist: 35,
		type: 'dps' }
]
