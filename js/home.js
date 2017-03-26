var loadingTextInterval;
var waitingForDataInterval;

function showHome(){

	
	clearInterval(loadingTextInterval);
	clearInterval(waitingForDataInterval);
	$("#screen").html(' ');	
	$("#screen").load("home.html"); 
	
	$("#loadingText").hide();
}


function checkForData(){


	

	if(localStorage.getItem("ServerIP") == null){
		showSettings();
	}

	var iteratePostitionLoading = 0;
	var loadingTextInterval = setInterval(function(){
		var loadingText = ["Welcome...", "We are currently searching your directories.", "This may take a while, depending on the ammount.", "Please wait."];
		
		if(iteratePostitionLoading > (loadingText.length - 1)){
			iteratePostitionLoading = 0;
		}
		$("#loadingText").hide();


		$("#loadingText").html(loadingText[iteratePostitionLoading]);
		
		$("#loadingText").fadeIn(2500);

		$("#loadingText").fadeOut(2500);

		iteratePostitionLoading++;


	}, 5000);
	var waitingForDataInterval = setInterval(function(){			
		if(sessionStorage.finishedReceiving == "true"){

			clearInterval(loadingTextInterval);
			$("#loader").html(' ');		
			$("#movies").html(' ');	
			$("#movies").load("movies.html"); 
			$("#series").html(' ');	
			$("#series").load("series.html"); 

			clearInterval(waitingForDataInterval);
		} 
	}, 500);


}