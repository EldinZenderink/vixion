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