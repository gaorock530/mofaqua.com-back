/**
	 * [isEqualIPAddress two IP address is in the same network.
	 * @param  {[String]}  ADDR1 [a].
	 * @param  {[String]}  Addr2 [two].
	 * @param  {[String]}  Mask [subnet]
	 * @return {Boolean}         [true or false]
	 */
	function isEqualIPAddress (addr1,addr2,mask){
		if(!addr1 || !addr2 || !mask){
			console.log("The parameters can not be empty");
			return false;
		}
		var 
		res1 = [],
		res2 = [];
		addr1 = addr1.split(".");
		addr2 = addr2.split(".");
		mask  = mask.split(".");
		for(var i = 0,ilen = addr1.length; i <ilen ; i += 1){
			res1.push(parseInt(addr1[i]) & parseInt(mask[i]));
			res2.push(parseInt(addr2[i]) & parseInt(mask[i]));
		}
		if(res1.join(".") == res2.join(".")){
			console.log("In the same network");
			return true;
		}else{
			console.log("Not in the same subnet");
			return false;
		}
	}