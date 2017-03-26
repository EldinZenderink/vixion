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
		getDataFromDB();
	}
	socket.onmessage = function(msg){
		console.log("RECEIVED: ");
		console.log(msg.data);
		try{
			parseData(JSON.parse(msg.data));
		} catch(err){
			
		}
		if(msg.data == "DONE"){
			console.log("series");	
			console.log(series);
			console.log("movies");	
			console.log(movies);
			socket.close();
			callbackOnDoneReceiving();
		}
		callbackOnConnectSucces();

	}

	socket.onclose = function(res){
		console.log("Close WS : ");
		console.log(res.reason);
		callbackOnConnectError();
	}
	socket.onerror = function(err){
		console.log("Error WS : ");
		console.log(err);
		callbackOnConnectError();
	}
	
}

function getDataFromDB(){
	socket.send("getFiles");
}

function parseData(files){
 	var info = files.info;
 	if(info.Type == "series"){
 		if(!containsObject(files, series)){
 			series.push(files);
 		}
 	} else {
 		if(!containsObject(files, movies)){
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