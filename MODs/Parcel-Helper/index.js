String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }

module.exports = function ParcelHelper(d) {

	// States
	const
		Idle = 0,
		PreparingDeletion = 1,
		PreparingParcels = 2,
		ClaimingParcels = 3
	
	let state = Idle,
		messageIds = []
	
	// Chat hooks
	d.command.add(['getmail', 'get'], (arg1) => {
		startProcedure(PreparingParcels)
	})
	
	d.command.add(['deletemail', 'del'], (arg1) => {
		startProcedure(PreparingDeletion)
	})
	
	/*
		Populate messageIds array
		
		Dispatching C_LIST_PARCEL will trigger the server to send S_LIST_PARCEL_EX, with this we can get analyze every message
		in the inbox and store the corresponding message id.
    */
	
	d.hook('S_LIST_PARCEL_EX', 1, sListParcelEx)
	d.hook('S_REPLY_REQUEST_CONTRACT', 1, sReplyRequestContract)
	d.hook('S_PARCEL_READ_RECV_STATUS', 2, sParcelReadRecvStatus)
	d.hook('S_RECV_PARCEL', 2, sRecvParcel)

	function startProcedure(startState) {
		messageIds = []
		state = startState
		checkMail(0)
	}
	
	function checkMail(pageIndex) {
		d.toServer('C_LIST_PARCEL', 2, {
			unk1: 0,
			page: pageIndex,
			filter: 0
		})
	}
	
	function sListParcelEx(event) {
		switch (state) {
			case PreparingDeletion:
				for (let i in event.messages) {
					// only accept id's of read messages and claimed parcels
					if (event.messages[i].read == 2) {
						messageIds.push({id: event.messages[i].id})
					}
				}	
				
				// check next page
				if (event.currentPage < event.totalPages - 1) {
					checkMail(event.currentPage + 1)
				} else {
					// no more pages to check, try deleting now
					if (messageIds.length > 0) {
						d.toServer('C_DELETE_PARCEL', 2, {
							messages: messageIds
						})
						d.command.message('所有邮件 ' + '已删除'.clr('FF0000'))
					} else {
						d.command.message('没有邮件需要 ' + '删除'.clr('E69F00'))
					}
					state = Idle
				}
				break
				
			case PreparingParcels:
				for (let i in event.messages) {
					// only accept id's of unclaimed parcels
					if (event.messages[i].type != 0 && event.messages[i].read != 2) {
						messageIds.push({id: event.messages[i].id})
					}
				}
				
				// check next page
				if (event.currentPage < event.totalPages - 1) {
					checkMail(event.currentPage + 1)
				} else {
					if (messageIds.length > 0) {
						state = ClaimingParcels
						requestContract()
						d.command.message('所有邮件 ' + '已接收'.clr('56B4E9'))
					} else {
						d.command.message('没有邮件需要 ' + '接收'.clr('E69F00'))
						state = Idle
					}
				}
				break
		}
	}
	
	/*  
		Parcels need to request a contract once and then all need to be read before being claimed.
		
		Start:
			C_REQUEST_CONTRACT
			S_REPLY_REQUEST_CONTRACT (or S_REQUEST_CONTRACT ?)
		Loop:
			C_SHOW_PARCEL_MESSAGE
			S_PARCEL_READ_RECV_STATUS ?
			C_RECV_PARCEL
			S_RECV_PARCEL
	*/
	
	function requestContract() {
		d.toServer('C_REQUEST_CONTRACT', 1, {
			type: 8
		})
    }
	
	function sReplyRequestContract(event) {
		if (state == ClaimingParcels) {
			readParcel()
		}
	}
	
	/*
		Parcel claim loop
		
		TODO: Find a better hook than S_PARCEL_READ_RECV_STATUS ??? What happens is it gets triggere twice, once from C_SHOW_PARCEL_MESSAGE and 
		again from S_RECV_PARCEL. So what happens is the S_PARCEL_READ_RECV_STATUS hook function will call claimParcel twice on the same parcel.
		This will cause every parcel to be claimed and then immediately fail, do this enough times and the client will disconnect and possibly crash. 
		The current solution is keep track of the parcel id that is currently being processed and ignore the second S_PARCEL_READ_RECV_STATUS execution,
		this is done with the queuedParcel variable.
	*/
	let queuedParcel = 0
	
	function readParcel() {
		if (messageIds.length > 0) {
			queuedParcel = messageIds[messageIds.length-1].id
			d.toServer('C_SHOW_PARCEL_MESSAGE', 1, {
				id: messageIds[messageIds.length-1].id
			})
		} else {
			state = Idle
		}
	}
	
	function sParcelReadRecvStatus(event) {
		if (state == ClaimingParcels ) {
			if (queuedParcel != 0 && queuedParcel == messageIds[messageIds.length-1].id) {
				queuedParcel = 0
				claimParcel()
			}
		}
	}
	
	function claimParcel() {
		if (messageIds.length > 0) {
			d.toServer('C_RECV_PARCEL', 1, {
				id: messageIds[messageIds.length-1].id
			})
		}
	}
	
	function sRecvParcel(event) {
		if (state == ClaimingParcels) {
			if (messageIds.length > 0) {
				messageIds.pop()
				readParcel()
			} else {
				state = Idle
			}
		}
	}

}
