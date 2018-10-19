jQuery(function($){
	for(var i = 1 ; i < 6; i++){
		$("#helpdoc").append("<li><a href='#' title=''><img src='help_doc_images/"+i+".png'></a></li>");
	}

	$('#demo3').slideBox({
		duration : 0.3,//滚动持续时间，单位：秒
		easing : 'linear',//swing,linear//滚动特效
		delay : 5,//滚动延迟时间，单位：秒
		hideClickBar : false,//不自动隐藏点选按键
		clickBarRadius : 10
	});
});


$(function(){
	init();//初始化
});
function init(){
	var bgPage = chrome.extension.getBackgroundPage();
	bgPage.change_config_help_doc_status();
}
