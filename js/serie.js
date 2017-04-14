var info;
function showSerie(key){
  $("#screen").fadeOut(0);
	$("#screen").html(' ');	
	$("#screen").load("serie.html"); 
  $("#screen").fadeIn(1000);
	info = series[key];
}

function onSerieLoad(){
	$('#title').html('<h4>' + info.info.Title + '</h4>');

  var imageUrl = info.info.Poster.replace("http://ia.media-imdb.com/images/M", "https://images-na.ssl-images-amazon.com/images/M");
  if(imageUrl.indexOf("N/A") > -1){
    imageUrl = "/img/cover.png";
  } 
	$('#poster').html('<img src="' + imageUrl + '" class="posteDesk" />');
	$('#synopsis').html('<h5><b>Synopsis</b></h5><hr>' + info.info.Plot);
	$('#rating').html('<h6><b>Rating: </b></h6>' + info.info.imdbRating);
	$('#actors').html('<h6><b>Actors: </b></h6>' +info.info.Actors);
	$('#genres').html('<h6><b>Genre: </b></h6>' +info.info.Genre);
	$('#awards').html('<h6><b>Awards: </b></h6>' +info.info.Awards);

	$.each(info.files, function(key, val){
		if(val.indexOf('/') < 0){			
			$('#files').append('<div class="row"><button onclick="copyTextToClipboard(\'' + encodeURI(val) + '\')" style="width: 100%;" class="waves-effect waves-light btn jewel" href="">' + val.split('\\')[val.split('\\').length - 1] + '</button></div>');
		} else {
			$('#files').append('<div class="row"><button onclick="copyTextToClipboard(\'' + encodeURI(val)+ '\')" style="width: 100%;" class="waves-effect waves-light btn jewel" href="">' + val.split('/')[val.split('/').length - 1] + '</button></div>');
		}
	});

	$('#title-mob').html('<center><h4>' + info.info.Title + '</h4></center>');
	$('#poster-mob').html('<img src="' + imageUrl + '" class="posterMob" />');
	$('#synopsis-mob').html('<h5><b>Synopsis</b></h5><br>' + info.info.Plot);
	$('#rating-mob').html('<h6><b>Rating: </b></h6>' + info.info.imdbRating);
	$('#actors-mob').html('<h6><b>Actors: </b></h6>' +info.info.Actors);
	$('#genres-mob').html('<h6><b>Genre: </b></h6>' +info.info.Genre);
	//$('#awards').html('<h6><b>Awards: </b></h6>' +info.info.Awards);

	$.each(info.files, function(key, val){
		if(val.indexOf('/') < 0){			
			$('#files-mob').append('<div class="row"><a style="width: 100%;" href="' + val + '" class="waves-effect waves-light btn jewel" href="">' + val.split('\\')[val.split('\\').length - 1] + '</a></div>');
		} else {
			$('#files-mob').append('<div class="row"><a style="width: 100%;" href="' + val + '" class="waves-effect waves-light btn jewel" href="">' + val.split('/')[val.split('/').length - 1] + '</a></div>');
		}
	})

  function ParseYoutubeSearchResults(data){
    var trailers = JSON.parse(data.replace("TRAILERS: ", ""));
     $('#trailer').html('<h6><b>Trailer:</b></h6><br /><div id="trailer"><iframe style="width: 100%; min-height: 360px;" src="https://www.youtube.com/' + Object.values(trailers)[0] + '" frameborder="0" allowfullscreen></iframe></div>');
     $('#trailer-mob').html('<h6><b>Trailer:</b></h6><br /><div id="trailer"><iframe style="width: 100%; min-height: 180px;" src="https://www.youtube.com/' + Object.values(trailers)[0] + '" frameborder="0" allowfullscreen></iframe></div>');
  }
  getTrailers(info.info.Title, ParseYoutubeSearchResults);

}


function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    alert('Succesfully copied video url! You can now open VLC and paste it there!');
  } catch (err) {
    alert('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}