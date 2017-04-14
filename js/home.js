var loadingTextInterval;
var waitingForDataInterval;

function showHome(){
	console.log("showing home");
	$("#screen").fadeOut(0);
	clearInterval(loadingTextInterval);
	clearInterval(waitingForDataInterval);
	$("#screen").html(' ');	
	$("#screen").load("home.html");
	$("#screen").css({"visibility":"visible"}); 
	$("#screen").fadeIn(1000);
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
			

			$(document).ready(function() {
			  var htmlCodeDesk = "";
			  var htmlCodeMob = "";
			  var noCoverDesk = "";
			  var noCoverMob = "";
			  $.each(series, function(index, val){
			  	if(val.info.Response == "True"){

			  		var imageUrl = val.info.Poster.replace("http://ia.media-imdb.com/images/M", "https://images-na.ssl-images-amazon.com/images/M");
			  		if(imageUrl.indexOf("N/A") > -1){
			  			imageUrl = "/img/cover.png";
			  			var desk = '<a href="#serie_' + index + '">\
			  						<div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " >\
					                <img src="' + imageUrl + '" class="posterImage"/>\
				                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
				              		</div>\
				              		</a>'; 
				    	var mob = '<a href="#serie_' + index + '"><div id="' + index + '" class="row valign-wrapper " ><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
			  			noCoverMob = noCoverMob + mob;
			  			noCoverDesk = noCoverDesk + desk;
			  		} else {
			  			var desk = '<a href="#serie_' + index + '">\
			  						<div href="#serie_' + index + '"id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light ">\
					                <img src="' + imageUrl + '" class="posterImage"/>\
				                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
				              		</div>\
				              		</a>'; 
				    	var mob = '<a href="#serie_' + index + '"><div href="#serie_' + index + '" id="' + index +'" class="row valign-wrapper " ><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
			  			htmlCodeDesk = htmlCodeDesk + desk;
				    	htmlCodeMob = htmlCodeMob + mob;
			  		}
		      
			      
				   
				}
			  }); 
			  	$('#sposters-desk').html(htmlCodeDesk);
			  	$('#sposters-mob').html(htmlCodeMob);
			  	$('#snoposters-desk').html(noCoverDesk);
			  	$('#snoposters-mob').html(noCoverMob);

			  	var htmlCodeDesk = "";
				  var htmlCodeMob = "";
				  var noCoverDesk = "";
				  var noCoverMob = "";
				  $.each(movies, function(index, val){
				  	if(val.info.Response == "True"){

				  		var imageUrl = val.info.Poster.replace("http://ia.media-imdb.com/images/M", "https://images-na.ssl-images-amazon.com/images/M");
				  		if(imageUrl.indexOf("N/A") > -1){
				  			imageUrl = "/img/cover.png";
				  			var desk = '<a href="#movie_' + index + '">\
				  						<div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " >\
						                <img src="' + imageUrl + '" class="posterImage"/>\
					                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
					              		</div>\
					              		</a>'; 
					    	var mob = '<a href="#movie_' + index + '"><div id="' + index +'" class="row valign-wrapper " onclick="showMovie(\'' + index + '\')"><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
				  			noCoverMob = noCoverMob + mob;
				  			noCoverDesk = noCoverDesk + desk;
				  		} else {
				  			var desk = '<a href="#movie_' + index + '"> <div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " >\
						                <img src="' + imageUrl + '" class="posterImage"/>\
					                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
					              	</div></a>'; 
					    	var mob = '<a href="#movie_' + index + '"><div id="' + index +'" class="row valign-wrapper " onclick="showMovie(\'' + index + '\')"><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
				  			htmlCodeDesk = htmlCodeDesk + desk;
					    	htmlCodeMob = htmlCodeMob + mob;
				  		}
				      
				      
					   
					}
				  }); 
				  	$('#mposters-desk').html(htmlCodeDesk);
				  	$('#mposters-mob').html(htmlCodeMob);
				  	$('#mnoposters-desk').html(noCoverDesk);
				  	$('#mnoposters-mob').html(noCoverMob);
			  });


			$("#movies").fadeIn();
			$("#series").fadeIn();
			clearInterval(waitingForDataInterval);
		} else {
			if(sessionStorage.parsing == "true"){
				var totalFiles = parseInt(sessionStorage.totalFiles);
				var parsedFiles = parseInt(sessionStorage.parsedFiles);
				var calculatePercentage = Math.round((parsedFiles / totalFiles) * 100);
				if(calculatePercentage >= 0){
					$("#loaderBar").show();
					$("#percentageFinished").show();
				} else {
					$("#loaderBar").hide();
					$("#percentageFinished").hide();
				}

				$("#loaderBar").css( "width", calculatePercentage + "%" );
				$("#percentageFinished").html("PARSING: " + calculatePercentage + '%');

			} else if(sessionStorage.receiving == "true"){
				var totalToReceive = parseInt(sessionStorage.totalFound);
				var received = parseInt(sessionStorage.totalSend);
				var calculatePercentage = Math.round((received / totalToReceive) * 100);
				if(calculatePercentage >= 0){
					$("#loaderBar").show();
					$("#percentageFinished").show();
				} else {
					$("#loaderBar").hide();
					$("#percentageFinished").hide();
				}

				$("#loaderBar").css( "width", calculatePercentage + "%" );
				$("#percentageFinished").html("RECEIVING: " + calculatePercentage + '%');

				if(calculatePercentage >= 100){
					sessionStorage.finishedReceiving = true;
				}
			}
			
		}
	}, 100);

	setInterval(function(){

		if(sessionStorage.cannotConnect == "true"){
			$('#noconnection').show();
			$("#loader").hide();
			$("#loaderBar").hide();
			$("#percentageFinished").hide();
		} else {
			$("#loader").show();
			$("#loaderBar").show();
			$("#percentageFinished").show();
			$('#noconnection').hide();
		}
	}, 500);


}