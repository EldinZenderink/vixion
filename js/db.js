var movies = [];
var series = [];

var alreadyParsed = [];

var socket;
function startComWithDB(ip, callbackOnConnectSucces, callbackOnDoneReceiving, callbackOnConnectError){
	Materialize.toast('Initiating connection to: ' + ip + ", waiting for connection." , 4000);
	socket = new WebSocket("ws://" + ip + ":4655");
	movies = [];
	series = [];
	socket.onopen = function(){
		console.log("Succesfully connected to websocket :D");

		Materialize.toast('Succesfully connected to: ' + ip + ", waiting for data." , 4000);	
		sessionStorage.parsedFiles = "0";
		sessionStorage.totalFiles = "100";

		getDataFromDB();
	}
	socket.onmessage = function(msg){
		sessionStorage.Connected = true;
		try{
			parseData(JSON.parse(msg.data));
		} catch(err){
			
		}
		if(msg.data.indexOf("FILES") > -1){
			sessionStorage.totalFiles = msg.data.split(':')[1].trim();
			sessionStorage.parsedFiles = "0";
		}
		if(msg.data.indexOf("PARSED") > -1){
			sessionStorage.parsedFiles = msg.data.split(':')[1].trim();
		}
		if(msg.data == "DONE"){
			socket.close();
			callbackOnDoneReceiving();
		}
		callbackOnConnectSucces();

	}

	socket.onclose = function(res){
		console.log("Close WS : ");
		console.log(res.reason);
		sessionStorage.Connected = false;
		callbackOnConnectError();
	}
	socket.onerror = function(err){
		console.log("Error WS : ");
		console.log(err);
		sessionStorage.Connected = false;
		callbackOnConnectError();
	}
	
}

function getDataFromDB(){
	socket.send("getFiles");
}

function parseData(files){
 	var info = files.info;
 	if(info.Type == "series"){
 		if(!containsObject(info.Title, series)){
 			series.push(files);
 		}
 	} else {
 		if(!containsObject(info.Title, movies)){
 			movies.push(files);
 		}
 	}
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

window.onbeforeunload = function() {
	try{
	    socket.onclose = function () {}; // disable onclose handler first
	    socket.close();

	} catch(err){
		console.log("Chrome doesnt have issues like this... god damn you edge: " + err);
	}
};