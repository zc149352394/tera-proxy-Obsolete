module.exports = function NoLockonYou(d) {

	d.hook('S_LOCKON_YOU', 1, sLockonYou)

	function sLockonYou() { 
		return false;
	};

}
