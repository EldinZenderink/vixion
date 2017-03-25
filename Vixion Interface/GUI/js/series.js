function showSeries(){

	$("#screen").html(' ');	
	$("#screen").load("series.html");

	//$('#posters-mob').html(htmlCodeMob);

	
}

function parseSeries(){
	$(document).ready(function() {
	    

	  var htmlCodeDesk = "";
	  var htmlCodeMob = "";
	  $.each(series, function(index, val){
	  	if(val.info.Response == "True"){
	  		var imageUrl = val.info.Poster;
	  		if(imageUrl.indexOf("http") >= 0){
	  			console.log("FOUND OUTDATED IMAGE LINK :(: " + imageUrl);
	  			imageUrl = imageUrl.replace("http://ia.media-imdb.com/images/M", "https://images-na.ssl-images-amazon.com/images/M");
	  			console.log("NEW LINK :)" + imageUrl)
	  		}
	        var desk = '<div id="' + val.info.imdbID +'" class="posterMain waves-effect waves-light " onclick="showSerie(\'' + index + '\')">\
			                <img src="' + imageUrl + '" class="posterImage"/>\
		                    <div class="posterTitle"><span class="posterTitleText">' + val.info.Title + '</span></div>\
		              	</div>'; 
		    var mob = '<div id="' + index +'" class="row valign-wrapper " onclick="showSerie(\'' + index + '\')"><div class="col s5"><img class="posterImageMob" src="' + imageUrl + '"/></div><div class="col s7"><span class="valign center-align"><b>' + val.info.Title + '</b></span></div></div>';
		    htmlCodeDesk = htmlCodeDesk + desk;
		    htmlCodeMob = htmlCodeMob + mob;
		}
	  }); 
	  	$('#posters-desk').append(htmlCodeDesk);
	  	$('#posters-mob').append(htmlCodeMob);
	  });

}