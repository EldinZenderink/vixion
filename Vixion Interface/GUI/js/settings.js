sessionStorage.Connected = false;
sessionStorage.finishedReceiving = false;

function showSettings(){

	$("#screen").html(' ');	
	$("#screen").load("settings.html"); 

}



function refreshServerList(){

 	var detectServers = new ClientSideServerDetection();
		//you can add multiple ports to check, but be aware that every new port to check increases search time significantly,
	//better check one port if possible.
	//if this is not set, default ports that will be checked are "80" and "8080"
	detectServers.setPorts(["4655"]);

	//runs the detection twice for every partial
	detectServers.setPartials([""]);

	//run the server detection, parameter is a callback function
	//you can run this multiple times
	detectServers.runDetection(thisDoesNothing);

	//callback function, needs a parameter which will contain server data *read more down below
	//in its current state, the callback function will be ran every single time a new unique server has been detected
	function thisDoesNothing(){

	}
	var intrv = setInterval(function(){
		if(sessionStorage.CSSDFound == "true"){

			var serverInfo = JSON.parse(sessionStorage.serversFound);
			 $('#servers').html(' ');
			for(var x = 0; x < serverInfo.length; x++){
	    		  $('#servers').append('<div class="col s12 row"><button class="btn jewel waves-effect waves-light " style="width: 100%;" onclick="connectToServer(\'' + serverInfo[x].ip + '\')">' + serverInfo[x].ip + '</button></div>');
	    	}
	    	$('#loaderServers').html(' ');
		}
	}, 500);
}

function onSettingsLoad(){
	if(sessionStorage.Connected == "false" ){
		connectToServer();
	} else {
		var ipdata = JSON.parse(localStorage.getItem("ServerIP"));
		$('#connectedserver').append('<div class="col s12 row"><button class="btn jewel waves-effect waves-light " style="width: 100%;">' + ipdata.ip + '</button></div>');
	}
}

function connectToServer(ip){
	if(ip === undefined){
		var ipdata = JSON.parse(localStorage.getItem("ServerIP"));
		if(sessionStorage.Connected == "false" && ipdata != null){
			startComWithDB(ipdata.ip, connectSucces, doneReceiving, connectError);
			sessionStorage.Connected == "pending";
			Materialize.toast('Trying to connected to ' + ipdata.ip, 4000);	


		} else {
			refreshServerList();
		}
	} else {

		localStorage.setItem("ServerIP", '{ "ip" : "' + ip + '", "succes" : false}');
		startComWithDB(ip, connectSucces, doneReceiving,  connectError);
		sessionStorage.Connected == "pending";
		Materialize.toast('Trying to connected to ' + ip, 4000);	
		showHome();
	}
	
}

function connectSucces(){
	console.log("CONNECTED YUS!");
	console.log(localStorage.getItem("ServerIP"));
	if(sessionStorage.Connected == "false"){
		sessionStorage.Connected = true;
		var ipdata = JSON.parse(localStorage.getItem("ServerIP"));
		if(!ipdata.succes){
			ipdata.succes = true;
			localStorage.setItem("ServerIP", JSON.stringify(ipdata));
		}

		Materialize.toast('Connected to ' + ipdata.ip, 4000);	
	}


}

function doneReceiving(){
	console.log("FINISHED RECEIVING :D");
	sessionStorage.finishedReceiving = "true";
}

function connectError(){
	sessionStorage.Connected = false;
	var ipdata = JSON.parse(localStorage.getItem("ServerIP"));
	if(ipdata.succes){
		localStorage.removeItem("ServerIP");
		refreshServerList();
	}
}
