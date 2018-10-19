//语种列表API接口
// var languageTypeUrl = httphostname+"/lang/query";
//语种列表临时变量
var language_type_list = {};

var sourceMap = {};//查看原文时缓存
var targetMap = {};//查看译文时缓存
var dict = {};
/**
 *	插件功能按钮监听器 
 *	@description 监听浏览器插件功能按钮鼠标点击事件
 *
 */
chrome.browserAction.onClicked.addListener(function(tab){
	bg_click(tab);


});


/**
 * 插件图标被点击
 */
function bg_click(tab){
	//记录当前插件的开关状态
	// chrome.browserAction.setIcon({path:"../images/" + "48.png"});
	var plugin_on_off = "";
	if(!localStorage["plugin_on_off"]){//如果当前插件开关状态不存在,则将开关状态标识为开启
		localStorage["plugin_on_off"] = "off";
	}else{//如果当前插件开关状态存在,则传递给功能条监听器		
		if(localStorage["plugin_on_off"] == "off"){
			plugin_on_off = "on";
		}else{
			plugin_on_off = "off";
		}
		localStorage["plugin_on_off"] = plugin_on_off;
	}
	firstInstall(tab);
	//通知content JavaScript 脚本执行插件功能条显示或移除动作
	changePluginBar(plugin_on_off,tab,false);

}

// 首次安装
function firstInstall(tab){
	if(localStorage["firstInstall"]=="true"){ 
		localStorage["firstInstall"]="false"
		chrome.tabs.sendMessage(tab.id,{
					action:"aaa"
				},function(response){})
	}
}
/**
 *	浏览器标签页 刷新/新建 监听器
 *	@description 监听器会捕获多次事件,正常会捕获两次事件,个别网站会多次,但是永恒不变的是changeInfo.status:loading和complete代表加载中和加载完成
 *	个别网站标签页新建或刷新时,还会伴随undefined的出现,无视即可
 *
 */
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	// 判断新建窗口是否为插件标签打开	

	//不论以前弹框状态如何,刷新后功能条状态为已关闭
	localStorage["plugin_on_off"] = "off"

	if(changeInfo.status == "loading"){//加载中
		
	}else if(changeInfo.status == "complete"){//加载完毕
		// show_bar(tab.id,"on","en","zh",true);
		//清理网页最后一次临时翻译信息
		clear_save_temp_source_target_action();		
			chrome.tabs.sendMessage(tab.id,{
					action:"auto_translate"
				},function(response){})

    	//加载完毕后根据插件当前开关状态通知content JavaScript是否显示插件功能条
    	//根据用户配置判断 - 用户是否允许当前自动弹出
    	var isAuto = isAutoShowBarByConfig();
    	if(isAuto){//允许自动弹出
			changePluginBar(localStorage["plugin_on_off"],tab,true);
		
		// ====
    	}else{//不允许自动弹出
    		//...
    	}

	}else{
		//无视,一般该分支为undefined情况
	}
});
/**
 * 弹出状态确认
 */
function changePluginBar(on_off,tab,isAuto){
	
	//选择当前激活的标签页
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	//检测某个标签页中内容的主要语言,谷歌浏览器使用detectLanguage,除了简体中文返回 zh-CN,未知语言将返回 und。
    	chrome.tabs.detectLanguage(tab.id, function(language) {
        	//从background向content script发送消息（该消息为一次性消息），告诉content script弹出/关闭翻译功能条
        	//按照谷歌官方文档，有三种消息模式，详情参阅：http://jingyan.baidu.com/article/414eccf616e2c56b431f0a97.html
        	
        	//自动的请求
        	if(isAuto){
	        	//判断依据:浏览器自定义里配置目标语言和当前网页语言不一致时弹功能条
	        	var browser_language = "";
	        	if(language.indexOf("-") > -1){
	        		browser_language = language.split("-")[0];
	        	}else{
					browser_language = language;
	        	}

	        	// alert("浏览器识别的语言："+browser_language +"_"+"配置语言："+localStorage["config_target_language"]);
	        	if(browser_language != localStorage["config_target_language"]  && browser_language != "und" ){

	        		//判断当前是否是网址翻译开启,如果网址翻译为已开启状态,获取当前标签页url中的already参数进行判断
	        		//因为会同时存在两个功能条,get_url_value_by_key()方法用于取出当前url中参数k-v
	        		var already = get_url_value_by_key(tab.url);
	        		//alert(already);
	        		if(already == null){
	        			firstInstall(tab);
						show_bar(tab.id,"on",browser_language,localStorage["config_target_language"],true);
		        		localStorage["plugin_on_off"] = "on";//改变状态为弹出状态

		        		//记录日志：插件自动弹出量记录
						show_log(true);
	        		}
	        		
	        	}
        	}else{//常规的请求
        		show_bar(tab.id,on_off,language,localStorage["config_target_language"],false);//关闭也好,弹出也好,根据localStorage当前的状态处理

				//记录日志：插件手动弹出量记录
				show_log(false);
        	}

      	});
    });

}

/**
 * 弹出日志记录
 */
function show_log(isAuto){
	if(isAuto){
		//记录日志：插件自动弹出量记录
		//调用setup_init.js中工具方法进行计数到localStorage
		value_increment("log_plugin_on_off_auto_counter");
	}else{
		//记录日志：插件手动弹出量记录
		//调用setup_init.js中工具方法进行计数到localStorage
		value_increment("log_plugin_on_off_counter");
	}
}


//弹出功能条通知
function show_bar(tabId,on_off,source_language,target_language,isAuto){
	chrome.tabs.sendMessage(
		tabId, 
		{	
			action: "action_change_plugin_bar",//通知动作,改变插件功能条显示/移除
			PLUGIN_ON_OFF:on_off,//插件开关变量
			SOURCE_LANGUAGE:source_language,//浏览器获得的源语言
			TARGET_LANGUAGE:target_language,//用户配置的默认目标语言
			LANGUAGE_TYPE_LIST:language_type_list,//语种列表对象
			IS_AUTO:isAuto,//是否自动识别弹出

			sourceMap : sourceMap,
			targetMap : targetMap,
			dict : dict
		}, 
		function(response) {
		
		}
	);
}

/**
 * 是否自动弹框根据用户配置
 */
function isAutoShowBarByConfig(){
	var isShow = true;
	var cast = localStorage["config_auto_show_tips"];
	var mark = cast.split("_")[0];//用户配置：1默认弹 2默认一天不弹 3默认一周不弹
	var time = cast.split("_")[1];//用户配置：发生配置时的毫秒数
	
	if(mark == 1){//弹
		isShow = true;
	}else if(mark == 2){
		//               天   时   分   秒
		var daylength = 24 * 60 * 60 * 1000;//得到一天的毫秒长度
		var currentTime = new Date().getTime();//当前时间
		if((currentTime - time) > daylength){//超过一天了,弹
			isShow = true;
		}else{
			isShow = false;
		}
	}else if(mark == 3){
		//               周  天   时   分   秒
		var weeklength = 7 * 24 * 60 * 60 * 1000;//得到一周的毫秒长度
		var currentTime = new Date().getTime();//当前时间
		if((currentTime - time) > weeklength){//超过一周了,弹
			isShow = true;
		}else{
			isShow = false;
		}
	}


	if(isShow){
		//将用户配置设置为默认
		localStorage['config_auto_show_tips'] = "1_1";
	}

	return isShow;
}

/**
 * 监听来自content script 的动作请求
 */
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	
	//页面功能条上关闭按钮请求
	var plugin_status = request.plugin_status;
	if(plugin_status == 0){
		localStorage["plugin_on_off"] = "off";
	}

	//页面功能条上打开配置页面请求
	var config = request.CONFIG;
	if(config == 1){
		chrome.tabs.create({ selected: true, url: './config.html' });
	}

	//页面功能条上打开LOGO页面请求
	var LOGO = request.LOGO;
	if(LOGO == 1){
		window.open(httphostname+"/index.html");
		//日志记录,在setup.init.js中定义
		log_collect_plugin_bar(11);
	}

	//页面功能条上打开FAQ请求
	var FAQ = request.FAQ;
	if(FAQ == 1){
		chrome.tabs.create({url:httphostname+"/common.html"});
		//日志记录,在setup.init.js中定义
		log_collect_plugin_bar(10);
	}
	// 测试
	var SHOW=request.SHOW;
	if(SHOW==1){
		chrome.tabs.create({ selected: true, url: request.AHREF});	
	}
	//页面功能条上打开人工翻译请求
	var PERSON_TRANS = request.PERSON_TRANS;
	if(PERSON_TRANS == 1){
		window.open("http://cus.yeecloud.com/yccustomer/ttype?language=zh");
		//日志记录,在setup.init.js中定义
		log_collect_plugin_bar(9);
	}

	

	//插件动作事件量日志记录
	btn_active_event_counter(request);

	//保存网页最后一次翻译信息到map
	save_temp_source_target_action(request);
});


/**
 * 插件动作事件量日志记录
 */
function btn_active_event_counter(request){

	//点击翻译量
	if(request.log_plugin_translate){
		//调用setup_init.js中工具方法进行计数到localStorage
		value_increment("log_plugin_translate");
	}

	//点击开启划词翻译量
	if(request.log_plugin_words_open){
		//调用setup_init.js中工具方法进行计数到localStorage
		value_increment("log_plugin_words_open");
	}


	//点击关闭划词翻译量
	if(request.log_plugin_words_close){
		//调用setup_init.js中工具方法进行计数到localStorage
		value_increment("log_plugin_words_close");
	}
}

/**
 * 保存网页最后一次翻译信息到map
 */
function save_temp_source_target_action(request){
	if(request.save_temp_source_target_action == "save_temp_source_target_action"){
		sourceMap = request.sourceMap;
		targetMap = request.targetMap;
		dict = request.dict;
	}
}

/**
 * 清理最后一次翻译信息
 */
function clear_save_temp_source_target_action(){
	sourceMap = {};
	targetMap = {};
	dict = {};
}