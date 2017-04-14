var movies = [];
var series = [];

var alreadyParsed = [];
var callbackTrailersReceived = null;

var socket;
function startComWithDB(ip, callbackOnConnectSucces, callbackOnDoneReceiving, callbackOnConnectError, callbackOnDirReceived){
	Materialize.toast('Initiating connection to: ' + ip + ", waiting for connection." , 4000);
	socket = new WebSocket("ws://" + ip + ":4655");
	movies = [];
	series = [];
	sessionStorage.cannotConnect = false;
	socket.onopen = function(){

		Materialize.toast('Succesfully connected to: ' + ip + ", waiting for data." , 4000);	
		sessionStorage.parsedFiles = "0";
		sessionStorage.totalFiles = "100";
		sessionStorage.totalSend = "0";
		sessionStorage.totalFound = "100";
		sessionStorage.parsing = false;
		sessionStorage.receiving = false;
		sessionStorage.finishedReceiving = false;
		sessionStorage.cannotConnect = false;
		sessionStorage.dir = "";
		getDirFromDB();
		setTimeout(function(){ getDataFromDB() }, 500);

	}
	socket.onmessage = function(msg){
		sessionStorage.Connected = true;
		console.log(msg.data);
		try{
			parseData(JSON.parse(msg.data));
		} catch(err){
			
		}

		if(msg.data.indexOf("DIR:") > -1){
			var splitter =  msg.data.split(':');
			var txt = "";
			for(var x = 1; x < splitter.length;  x++){
				txt = txt + splitter[x];
			}
			sessionStorage.dir = txt;
			callbackOnDirReceived(txt);
		}

		if(msg.data.indexOf("FILES") > -1){

			sessionStorage.totalFiles = msg.data.split(':')[1].trim();
			sessionStorage.parsedFiles = "0";
			sessionStorage.parsing = true;

		}
		if(msg.data.indexOf("PARSED") > -1){
			sessionStorage.parsedFiles = msg.data.split(':')[1].trim();
		}

		if(msg.data.indexOf("FOUND") > -1){
			sessionStorage.totalFound = msg.data.split(':')[1].trim();
			sessionStorage.receiving = true;
		}

		if(msg.data.indexOf("SEND") > -1){
			try{
				sessionStorage.totalSend = msg.data.split(':')[1].trim();
			} catch (e){
				sessionStorage.totalSend = msg.data.split(':')[1];
			}
			
		}

		if(msg.data == "DONEPARSING"){
			sessionStorage.parsing = false;
		}
		if(msg.data == "DONESENDING"){			
			sessionStorage.parsing = false;
			sessionStorage.receiving = false;
			sessionStorage.finishedReceiving = true;
			callbackOnDoneReceiving();
		}

		if(msg.data.indexOf("TRAILERS:") > -1){
			try{

				callbackTrailersReceived(msg.data);
			} catch(E){

			}
		}
		callbackOnConnectSucces();

	}

	socket.onclose = function(res){
		socket = new WebSocket("ws://" + ip + ":4655");
		console.log("Close WS : ");
		console.log(res.reason);
		Materialize.toast('Disconnected from: ' + ip , 4000);	

		sessionStorage.cannotConnect = true;
		sessionStorage.Connected = false;
		callbackOnConnectError();
	}
	socket.onerror = function(err){
		Materialize.toast('Cannot reach: ' + ip + ', are your sure your server is running?', 4000);
		console.log("Error WS : ");
		console.log(err);
		sessionStorage.cannotConnect = true;
		sessionStorage.Connected = false;
		callbackOnConnectError();
	}
	
}

function getDataFromDB(){

	series = [];
	movies = [];
	sessionStorage.finishedReceiving == "true";
	socket.send("getFiles");
}

function getDirFromDB(){
	socket.send("GetDir");
}

function setDir(dir){
	socket.send("SetDir:" + dir);
	
	setTimeout(function(){socket.send("getFiles");}, 500);
}

function getTrailers(title, callback){
	socket.send("GetYoutubeTrailer:" + title);
	callbackTrailersReceived= callback;
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