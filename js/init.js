(function($){
  $(function(){

    $('.button-collapse').sideNav();
    connectToServer();
    showHome();
	$('.modal').modal();
	console.log(navigator.sayswho.toLowerCase().indexOf("chrome"));
    if(navigator.sayswho.toLowerCase().indexOf("chrome") == -1 && navigator.sayswho.toLowerCase().indexOf("firefox") == -1){
    	$('#WrongBrowser').modal('open');
    }
  }); // end of document ready
})(jQuery); // end of jQuery name space


navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

$(window).on('popstate', function (e) {
    var state = e.originalEvent.state;
    if (state !== null) {
        alert('your trying to go back, arent you?');
    }
});

var previousPage = window.location.href;
setInterval(function(){
	var currentPage = window.location.href;
	if(currentPage != previousPage){
		if(currentPage.indexOf('#') > -1){
			if(currentPage.indexOf('series') > -1){
				showSeries();
			} else if(currentPage.indexOf('movies') > -1){
				showMovies();
			} else if(currentPage.indexOf('serie') > -1){
				var index = parseInt(currentPage.split('_')[1]);
				showSerie(index);
			} else if(currentPage.indexOf('movie') > -1){
				var index = parseInt(currentPage.split('_')[1]);
				showMovie(index);
			} else if(currentPage.indexOf('settings') > -1){
				showSettings();
			} else if(currentPage.indexOf('home') > -1){
				showHome();
			}else if(currentPage.indexOf('unknown') > -1){
				showUnknown();
			}
		}			
	}

	previousPage = currentPage;
}, 100);

sessionStorage.CSSDFound= false;
sessionStorage.Connected = false;
sessionStorage.parsedFiles = "0";
sessionStorage.totalFiles = "100";
sessionStorage.totalSend = "0";
sessionStorage.totalFound = "100";
sessionStorage.parsing = false;
sessionStorage.receiving = false;
sessionStorage.finishedReceiving = false;