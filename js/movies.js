function showMovies(){
	$("#screen").fadeOut(0);
	$("#screen").html(' ');	
	$("#screen").load("movies.html");
	$("#screen").fadeIn(1000);
	//$('#posters-mob').html(htmlCodeMob);

	
}

function parseMovies(){
	$(document).ready(function() {    

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
		  						<div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light ">\
				                <img src="' + imageUrl + '" class="posterImage"/>\
			                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
			              		</div>\
			              		</a>'; 
			    	var mob = '<a href="#movie_' + index + '"><div id="' + index +'" class="row valign-wrapper " ><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
		  			noCoverMob = noCoverMob + mob;
		  			noCoverDesk = noCoverDesk + desk;
		  		} else {
		  			var desk = '<a href="#movie_' + index + '"> <div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " onclick="showMovie(\'' + index + '\')">\
				                <img src="' + imageUrl + '" class="posterImage"/>\
			                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
			              	</div></a>'; 
			    	var mob = '<a href="#movie_' + index + '"><div id="' + index +'" class="row valign-wrapper " ><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div></a>';
		  			htmlCodeDesk = htmlCodeDesk + desk;
			    	htmlCodeMob = htmlCodeMob + mob;
		  		}
		      
			   
			}
		  }); 
		  	$('#posters-desk').html(htmlCodeDesk);
		  	$('#posters-mob').html(htmlCodeMob);
		  	$('#noposters-desk').html(noCoverDesk);
		  	$('#noposters-mob').html(noCoverMob);
	   });
	


}