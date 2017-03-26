/*
LIBRARY FOR DETECTING LOCAL HOSTED SERVERS

BE AWARE THAT THIS LIBRARY IS DESIGNED TO WORK WITH THE FOLLOWING BROWSERS:  Mozilla, Chrome & Opera AND DEFAULT BROWSERS RUNNING ON THE FOLLOWING OSSES: Android and iOS
IN CASE YOU WANT TO USE THIS LIBRARY WITH OTHER BROWSERS, YOU NEED TO MANUALLY DEFINE A BASE IP, A EXAMPLE FOR A BASE IP IS GIVEN BELOW:

server ip:  a.x.d.f - client(local) ip: a.x.d.g (or in numbers, server ip: 192.168.65.5 - client ip(local): 192.168.65.132)
base ip: a.x.d (or in numbers: 192.168.65)

YOU DO NEED JQUERY FOR THIS TO WORK... just in case...

Released under MIT License. Enjoy!
Eldin Zenderink 02-07-2016
*/
var serversFound = [];
var localIpReturned = false;
function detectWSocketServers(){
	serversFound = [];
	localIpReturned = false;
	sessionStorage.serversFound = JSON.stringify(serversFound);

	getLocalIp(actuallyDetectWSServers);

}

function webSocketRequest(ip, port){
	var ws = new WebSocket("ws://" + ip + ":" + port);
	var serverInfo = {
		ip: ip,
		port: port,
		data: "",
		type: "WS"
	}
	ws.onopen = function(data){
		console.log("found connection at: " + ip);
		serverInfo.ip = ip;
		serverInfo.port = port;
		serverInfo.data = data;
		serverInfo.type = "WS";
		serversFound.push(serverInfo)	
		ws.close();
	}	
}


function actuallyDetectWSServers(baseIp){
	console.log("Found your local ip: " + baseIp);
	var ipToGoThrough = 1; 
	sessionStorage.CSSDFound = false;
	var checkIp = setInterval(function(){
		console.log(baseIp + '.' + ipToGoThrough);
		webSocketRequest(baseIp + '.' + ipToGoThrough, 4655);
		ipToGoThrough++;
		if(ipToGoThrough > 254){

			sessionStorage.CSSDFound = true;
			clearInterval(checkIp);
		}		
	}, 100);

	try{
		clearInterval(generalCheck);
	} catch (err){
		console.log("general check not running yet");
	}
	var generalCheck = setInterval(function(){
		sessionStorage.serversFound = JSON.stringify(serversFound);
	}, 200);
}

function getLocalIp (callback){
	try{

		//contains every ip found
		var arrayWithIps = [];
	    //compatibility for firefox and chrome
	    var RTCPeerConnection = window.RTCPeerConnection
	        || window.mozRTCPeerConnection
	        || window.webkitRTCPeerConnection;
	    var useWebKit = !!window.webkitRTCPeerConnection;

	    //minimal requirements for data connection
	    var mediaConstraints = {
	        optional: [{RtpDataChannels: true}]
	    };

	    var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

	    //construct a new RTCPeerConnection
	    var pc = new RTCPeerConnection(servers, mediaConstraints);

	    function handleCandidate(candidate){
	        //match just the IP address
	        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
	        var ip_addr = ip_regex.exec(candidate)[1];
	        return ip_addr;
	    }


	    //listen for candidate events
	    pc.onicecandidate = function(ice){
	        //skip non-candidate events
	        if(ice.candidate && !localIpReturned){
	            var ip = handleCandidate(ice.candidate.candidate);
	            //call callback and return ip, which is in most cases local ip
	        	var ipParts = ip.split('.');
				baseIp = "";
				for(var x = 0; x < 3; x++){
					baseIp =  baseIp + ipParts[x] + ".";
				}
				baseIp = baseIp.substr(0, baseIp.length - 1);
				localIpReturned = true;
				console.log("found ip: "+ ip);
				callback(baseIp);
	        }
	    };


	    //create a bogus data channel
	    pc.createDataChannel("");

	    //create an offer sdp
	    pc.createOffer(function(result){
	        //trigger the stun server request
	        pc.setLocalDescription(result, function(){}, function(){});

	    }, function(){});

	    //read candidate info from local description
	    try{

	        var lines = pc.localDescription.sdp.split('\n');
	        lines.forEach(function(line){
	            if(line.indexOf('a=candidate:') === 0){
	                handleCandidate(line);
	            }
	        });
	    } catch(err){
	    	console.log(err);
	    }
	} catch(err){
		console.log("You probably aren't using chrome or firefox... ERROR: " + err);
	}
}

function webSocketRequest(ip, port){
	var ws = new WebSocket("ws://" + ip + ":" + port);
	var serverInfo = {
		ip: ip,
		port: port,
		data: "",
		type: "WS"
	}
	ws.onopen = function(data){
		console.log("found connection at: " + ip);
		serverInfo.ip = ip;
		serverInfo.port = port;
		serverInfo.data = data;
		serverInfo.type = "WS";
		serversFound.push(serverInfo);	
		ws.close()
	};	
}

