function showMovies(){
	console.log("showing movies");
	$("#screen").html(' ');	
	$("#screen").load("movies.html");

	//$('#posters-mob').html(htmlCodeMob);

	
}

function parseMovies(){
	$(document).ready(function() {
	    

	  var htmlCodeDesk = "";
	  var htmlCodeMob = "";
	  $.each(movies, function(index, val){
	  	if(val.info.Response == "True"){
	  		var imageUrl = val.info.Poster;
	  		if(imageUrl.indexOf("http")){
	  			imagerUrl = imageUrl.replace("http://ia.media-imdb.com/images/M", "https://images-na.ssl-images-amazon.com/images/M");
	  		}
		    var desk = '<div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " onclick="showMovie(\'' + index + '\')">\
			                <img src="' + imageUrl + '" class="posterImage"/>\
		                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
		              	</div>'; 
		    var mob = '<div id="' + index +'" class="row valign-wrapper " onclick="showMovie(\'' + index + '\')"><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div>';
		    htmlCodeDesk = htmlCodeDesk + desk;
		    htmlCodeMob = htmlCodeMob + mob;
		}
	  }); 
	  $('#movies-posters-desk').append(htmlCodeDesk);
	  $('#movies-posters-mob').append(htmlCodeMob);
  	});

}