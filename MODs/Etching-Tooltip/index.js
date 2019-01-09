module.exports = function EtchingTooltip(d) {

    d.hook('S_SHOW_ITEM_TOOLTIP', 9, sShowItemTooltip)

	function sShowItemTooltip(event) {
        if ((event.etching2 - 4010301) % 2 == 0)
            event.etching3 = event.etching1
            return true
    }

}

/*
	etch1   etch2   name
	4010280 0       Pumped Etching: Pumped I
	4010281 0       Keen Etching: Keen I
	4010282 0       Quickstep Etching: Quicksteps I
	4010283 0       Pumped Etching: Pumped II
	4010284 0       Keen Etching: Keen II
	4010285 0       Quickstep Etching: Quicksteps II
	4010286 4010301 Pumped Etching: Pumped II + Relentless
	4010287 4010301 Keen Etching: Keen II + Relentless + Relentless
	4010288 4010301 Quickstep Etching: Quicksteps II + Relentless
	4010289 4010302 Pumped Etching: Pumped III
	4010290 4010302 Keen Etching: Keen III
	4010291	4010302 Quickstep Etching: Quicksteps III
	4010292 4010303 Pumped Etching: Pumped III + Relentless         
	4010293 4010303 Keen Etching: Keen III + Relentless + Relentless
	4010294 4010303 Quickstep Etching: Quicksteps III + Relentless
	4010295 4010304 Pumped Etching: Pumped IV
	4010296 4010304 Keen Etching: Keen IV
	4010297 4010304	Quickstep Etching: Quicksteps IV
	4010298 4010305 Pumped Etching: Pumped IV + Relentless          
	4010299 4010305 Keen Etching: Keen IV + Relentless              
	4010300 4010305 Quickstep Etching: Quicksteps IV + Relentless
*/
