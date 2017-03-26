function showUnknown(){

	$("#screen").html(' ');	
	$("#screen").load("unknown.html"); 

}

function onUnknownLoad(){
	$(document).ready(function() {
	    

	  var htmlCode= "";
	  $.each(movies, function(index, val){

	  	if(val.info.Response == "False"){

	  		$.each(val.files, function(index, val){
	  			if(val.indexOf('/') < 0){
		  			var desk = '<div class="row">\
				                	<button src="' + val + '" class="btn waves-effect waves-light  jewel"> ' + val.split('\\')[val.split('\\').length - 1] + ' </button>\
			              		</div>'; 
			        htmlCode = htmlCode + desk; 

	  			}   else {
	  				var desk = '<div class="row">\
				                	<button src="' + val + '" class="btn waves-effect waves-light  jewel"> ' + val.split('/')[val.split('/').length - 1] + ' </button>\
			              		</div>'; 
			        htmlCode = htmlCode + desk; 
	  			}

	  		});
			
	  	}
	  }); 
	  $('#unknownMoviesSeries').append(htmlCode);
  	});


}