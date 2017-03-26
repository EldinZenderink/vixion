var movies = [];
var series = [];

var alreadyParsed = [];

var socket;
function startComWithDB(ip, callbackOnConnectSucces, callbackOnDoneReceiving, callbackOnConnectError){
	socket = new WebSocket("ws://" + ip + ":4655");

	socket.onopen = function(){
		console.log("Succesfully connected to websocket :D");
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
    socket.onclose = function () {}; // disable onclose handler first
    socket.close();
};