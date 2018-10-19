//插件安装初始化

//access_token后缀
var headers_suffix = "_TWGDH";

//通过搜狐接口得到用户IP
var ip_url = 'http://pv.sohu.com/cityjson';

//接口主机头
var httphostname = "http://web.yeekit.com";
// var httphostname = "http://192.168.16.141:8081";
localStorage["httphostname"] = httphostname;
//日志上报接口
var log_upload_url = httphostname + "/log/langlog";

//语种列表API接口
var languageTypeUrl = httphostname+"/lang/query";
// var languageTypeUrl ="http://192.168.16.141:8091/lang/query";
//语种列表定时刷新任务
langTypeInterval_task();
/**
 * 语种列表定时刷新
 */
function langTypeInterval_task(){
	//语种列表缓存
	languageType2Cache();//语种列表缓存,缓存key:plugin_language_type 缓存value格式:zh_中文,en_英文,ru_俄语,pt_葡语,fr_法语
	var tasksec = 60*60*24;//24小时请求一次,获取最新语种列表列表
	var langTypeInterval = setInterval(function() {
			languageType2Cache();
	}, 1000 * tasksec);
}

/**
 * 当应用第一次安装、更新至新版本时产生 监听器
 */
chrome.runtime.onInstalled.addListener(function(exInfo){
	//logo小红点
	// chrome.browserAction.setIcon({path:"../images/" + "48point.png"});
	//配置信息初始化
	config_init(exInfo);
	localStorage["firstInstall"]="true";
});

/**
 * 卸载时监听
 */
chrome.runtime.onSuspend.addListener(function(){
	// alert("卸载");
	uninstall_log();
});



//配置信息初始化
function config_init(exInfo){

	//----------------------------------------------------插件信息初始化start--------------------------------------------------------
	// 首次安装

	//插件渠道

	localStorage['log_common_info_channel'] = "0000";//目前定义0为官网渠道,后续的渠道整形增长,比如1代表谷歌商店渠道	

	//分发途径
	localStorage['log_common_info_distribute'] = 0;//目前定义0为官方途径,1为非官方途径

	//插件身份信息标识初始化
	localStorage['log_common_info_plugin_uuid'] = create_uuid();

	//插件版本号初始化
	localStorage['log_common_info_version'] = '2.0.3';

	//浏览器型号初始化
	localStorage['log_common_info_browser'] = (BroswerUtil.getBrowserVersion()+"").split(",")[0];

	//浏览器型号版本号初始化
	localStorage['log_common_info_browser_version'] = (BroswerUtil.getBrowserVersion()+"").split(",")[1];

	//操作系统型号初始化
	localStorage['log_common_info_os_type'] = (getOS()+"").split(",")[0];

	//操作系统型号版本号初始化
	localStorage['log_common_info_os_type_version'] = (getOS()+"").split(",")[1];

	//IP地址获取
	localStorage['log_common_info_ip'] = getIp();

	//地址获取
	localStorage['log_common_info_address'] = getAddress();

	//浏览器语言
	localStorage['log_common_info_browser_lang'] = navigator.language;

	//----------------------------------------------------插件信息初始化end----------------------------------------------------------


	//----------------------------------------------------插件日志按钮事件计数器归零start--------------------------------------------
	
	//插件弹出计数器
	localStorage['log_plugin_on_off_counter'] = 0;//插件手动弹出计数器归零
	
	//插件弹出计数器
	localStorage['log_plugin_on_off_auto_counter'] = 0;//插件自动弹出计数器归零

	//点击翻译计数器
	localStorage['log_plugin_translate'] = 0;//插件点击翻译计数器归零

	//点击开启划词翻译计数器
	localStorage['log_plugin_words_open'] = 0;//插件点击开启划词翻译计数器归零

	//点击关闭划词翻译计数器
	localStorage['log_plugin_words_close'] = 0;//插件点击关闭划词翻译计数器归零

	//自动识别弹出提醒-今天不弹 计数器
	localStorage['log_plugin_config_auto_show_tips_day'] = 0;//插件自动识别弹出提醒-今天不弹 计数器 归零

	//自动识别弹出提醒-一周不弹 计数器
	localStorage['log_plugin_config_auto_show_tips_week'] = 0;//插件自动识别弹出提醒-一周不弹 计数器 归零

	//最新资讯弹出提醒-一周不弹 计数器
	localStorage['log_plugin_config_new_info_week'] = 0;//插件最新资讯弹出提醒-一周不弹 计数器 归零

	//----------------------------------------------------插件日志按钮事件计数器归零end----------------------------------------------



	//----------------------------------------------------插件功能初始化start--------------------------------------------------------


	//插件弹出开关状态
	localStorage['plugin_on_off'] = 'off';//插件弹出开关状态置为关闭

	//语种列表缓存
	// languageType2Cache();//语种列表缓存,缓存key:plugin_language_type 缓存value格式:zh_中文,en_英文,ru_俄语,pt_葡语,fr_法语

	//帮助文档未读状态初始化
	// chrome.browserAction.setPopup({popup:"popup.html"});

	//推送初始化 - 最后一次推送的消息id
	localStorage["cache_last_info_id"] = "";

	//----------------------------------------------------插件功能初始化end-----------------------------------------------------------


	//----------------------------------------------------自定义配置信息初始化start---------------------------------------------------
	//登陆状态 
	localStorage["login_stat"]="false"
	//偏好目标语言初始化
	localStorage["config_target_language"] = "zh";

	//自动识别弹出提醒 1默认开启 2今天不弹 3一周不弹
	//第二个1代表进行此次配置时的时间戳,已配置时间距离1970年的毫秒数为时间戳
	localStorage["config_auto_show_tips"] = "1_1";

	//最新资讯消息 1默认开启 3一周不弹
	//第二个1代表进行此次配置时的时间戳,已配置时间距离1970年的毫秒数为时间戳
	localStorage["config_new_info"] = "1_1";

	//----------------------------------------------------自定义配置信息初始化end-----------------------------------------------------
	
	
	//----------------------------------------------------安装日志记录start-----------------------------------------------------------
	
	//安装日志向服务器发送
	setup_log(exInfo);

	//----------------------------------------------------安装日志记录end-------------------------------------------------------------

}







//--------------------------------------------------------初始化业务数据方法start-----------------------------------------------------

/**
 * 初始化语种列表获取缓存到localStorage
 */
function languageType2Cache(){
	$.ajax({
	  url: languageTypeUrl,
	  type: 'POST',
	  dataType: 'json',
	  headers: {
            "access_token":getResult()
      },
	  data: {},
	  success: function(data) {
	    //called when successful
	    if(data != null){
	    	var langlist = data.data;
	    	var plugin_language_type = "";
	    	for(var i = 0 ; i < langlist.length; i++){
	    		var lang = langlist[i];
	    		if(i == (langlist.length - 1)){
					plugin_language_type += lang.langCode+"_"+lang.langName;
	    		}else{
	    			plugin_language_type += lang.langCode+"_"+lang.langName+",";
	    		}
	    		
	    	}
	    	if(plugin_language_type.length==0){
	    		plugin_language_type = "zh_中文,en_英文,ru_俄语,pt_葡语,fr_法语,ko_韩语,de_德语";
	    	}
	    	localStorage["plugin_language_type"] = plugin_language_type;
	    	//初始化语种到全局变量
	    	languageType2Cache_execute(plugin_language_type.split(","));
	    }
	  }
	});
	// localStorage["plugin_language_type"] = "zh_中文,en_英文,ru_俄语,pt_葡语,fr_法语";
	
}


/**
 * 执行语种列表获取任务
 */
function languageType2Cache_execute(langList){
	
	//偏好语言排在最前面
	var config_target_language = localStorage["config_target_language"];
	for(var i = 0; i < langList.length; i++){
		var langCode = langList[i].split("_")[0];
		if(langCode == config_target_language){//得到偏好语言的langName
		  	var langName = langList[i].split("_")[1];
			language_type_list[langCode] = langName;
		}
	
	}

	//将除偏好语言之外的其它语言排在后面
	for(var i = 0; i < langList.length; i++){
		var langCode = langList[i].split("_")[0];		
		if(langCode != config_target_language){
			var langName = langList[i].split("_")[1];
			language_type_list[langCode] = langName;
		}

	}
}

/**
 * 改变帮助文档已读标识 - 初始安装后,阅读后教程后清除popup
 */
function change_config_help_doc_status(){
	// chrome.browserAction.setPopup({popup:""});//popup:""将不显示 popup:"popup.html"将显示
	// chrome.browserAction.setIcon({path:"../images/" + "48.png"});
}


/**
 * 身份认证信息初始化
 */
function create_access_token(){
	//生成令牌
	//和服务器约定：这个串是毫秒数时间戳加字母TWGDH
	//形如：12315645645-TWGDH
	return (new Date().getTime()) + "_TWGDH";
}

/**
 * 安装日志记录
 */
function setup_log(exInfo){

	//动作类型判断
	var log_active_type = 0;
	var log_old_version = 0;//老插件版本
	if(exInfo.reason == "install"){//安装
		log_active_type = 1;//1安装2升级3卸载
	}else if(exInfo.reason == "update" || exInfo.reason == "chrome_update" ||exInfo.reason == "shared_module_update" ){//升级
		log_old_version = exInfo.previousVersion;//老插件版本
		log_active_type = 2;
	}

	var log_create_time1 = new Date().getTime();//时间
	var log_create_time2 = log_create_time1;
	//插件渠道
	var log_channel = localStorage['log_common_info_channel'];

	//插件分发途径
	var log_distribute = localStorage['log_common_info_distribute'];

	//插件身份信息标识初始化
	var log_uuid = localStorage['log_common_info_plugin_uuid'];

	//插件版本号初始化
	var log_version = localStorage['log_common_info_version'];

	//浏览器型号初始化
	var log_browser = localStorage['log_common_info_browser'];

	//浏览器型号版本号初始化
	var log_browser_version = localStorage['log_common_info_browser_version'];

	//操作系统型号初始化
	var log_os = localStorage['log_common_info_os_type'];

	//操作系统型号版本号初始化
	var log_os_version = localStorage['log_common_info_os_type_version'];

	//IP地址获取
	var log_ip = localStorage['log_common_info_ip'];

	//地址获取
	var log_address = localStorage['log_common_info_address'];

	

	var log = "06|"+log_create_time1+"|"+log_create_time2+"|"+log_os+"|"+log_os_version+"|"+log_browser+"|"+log_browser_version+"|"
			+log_uuid+"|"+log_ip+"|"+log_address+"|"+log_old_version+"|"+log_version+"|"+log_channel+"|"+log_distribute+"|"+log_active_type;

	localStorage["log_upload_setup_update_uninstall_"+(new Date().getTime())] = log;
	
}

/**
 * 卸载日志记录
 */
function uninstall_log(){

	//动作类型判断
	var log_active_type = 3;
	var log_old_version = "0";//老插件版本

	var log_create_time = new Date().getTime();//时间
	//插件渠道
	var log_channel = localStorage['log_common_info_channel'];

	//插件分发途径
	var log_distribute = localStorage['log_common_info_distribute'];

	//插件身份信息标识初始化
	var log_uuid = localStorage['log_common_info_plugin_uuid'];

	//插件版本号初始化
	var log_version = localStorage['log_common_info_version'];

	//浏览器型号初始化
	var log_browser = localStorage['log_common_info_browser'];

	//浏览器型号版本号初始化
	var log_browser_version = localStorage['log_common_info_browser_version'];

	//操作系统型号初始化
	var log_os = localStorage['log_common_info_os_type'];

	//操作系统型号版本号初始化
	var log_os_version = localStorage['log_common_info_os_type_version'];

	//IP地址获取
	var log_ip = localStorage['log_common_info_ip'];

	//地址获取
	var log_address = localStorage['log_common_info_address'];

	

	var log = "06|"+log_create_time1+"|"+log_create_time2+"|"+log_os+"|"+log_os_version+"|"+log_browser+"|"+log_browser_version+"|"
			+log_uuid+"|"+log_ip+"|"+log_address+"|"+log_old_version+"|"+log_version+"|"+log_channel+"|"+log_distribute+"|"+log_active_type;

	localStorage["log_upload_setup_update_uninstall_"+(new Date().getTime())] = log;
}

//--------------------------------------------------------初始化业务数据方法end--------------------------------------------------------------






//-----------------------------------------Background级别工具类代码(所有background脚本都可用)start-------------------------------------------

/**
 * uuid序列号生成
 */
function create_uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}


/**
 * 操作系统及浏览器检测工具
 */
var BroswerUtil = {
  //检测浏览器版本
  	getBrowserVersion: function () {
    	var agent = navigator.userAgent.toLowerCase();
    	var arr = [];
	    var Browser = "";
	    var Bversion = "";
	    var verinNum = "";
	    //IE
	    if (agent.indexOf("msie") > 0) {
			var regStr_ie = /msie [\d.]+;/gi;
			Browser = "IE";
			Bversion = "" + agent.match(regStr_ie);
	    }
	    //firefox
	    else if (agent.indexOf("firefox") > 0) {
			var regStr_ff = /firefox\/[\d.]+/gi;
			Browser = "firefox";
			Bversion = "" + agent.match(regStr_ff);
	    }
	    //Chrome
	    else if (agent.indexOf("chrome") > 0) {
			var regStr_chrome = /chrome\/[\d.]+/gi;
			Browser = "chrome";
			Bversion = "" + agent.match(regStr_chrome);
	    }
	    //Safari
	    else if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
			var regStr_saf = /version\/[\d.]+/gi;
			Browser = "safari";
			Bversion = "" + agent.match(regStr_saf);
	    }
	    //Opera
	    else if (agent.indexOf("opera") >= 0) {
			var regStr_opera = /version\/[\d.]+/gi;
			Browser = "opera";
			Bversion = "" + agent.match(regStr_opera);
	    } else {
			var browser = navigator.appName;
			if (browser == "Netscape") {
				var version = agent.split(";");
				var trim_Version = version[7].replace(/[ ]/g, "");
		        var rvStr = trim_Version.match(/[\d\.]/g).toString();
		        var rv = rvStr.replace(/[,]/g, "");
		        Bversion = rv;
		        Browser = "IE"
	      	}
	    }
	    verinNum = (Bversion + "").replace(/[^0-9.]/ig, "");
	    // arr.push(Browser);
	    // arr.push(",");
	    // arr.push(verinNum);
	    return Browser+","+verinNum;
  },
  //检测是否是XX浏览器
  WB: (function () {
    var UserAgent = navigator.userAgent.toLowerCase();
    return {
		isIE6: /msie 6.0/.test(UserAgent), // IE6
		isIE7: /msie 7.0/.test(UserAgent), // IE7
		isIE8: /msie 8.0/.test(UserAgent), // IE8
		isIE9: /msie 9.0/.test(UserAgent), // IE9
		isIE10: /msie 10.0/.test(UserAgent), // IE10
		isIE11: /msie 11.0/.test(UserAgent), // IE11
		isLB: /lbbrowser/.test(UserAgent), // 猎豹浏览器
		isUc: /ucweb/.test(UserAgent), // UC浏览器
		is360: /360se/.test(UserAgent), // 360浏览器
		isBaidu: /bidubrowser/.test(UserAgent), // 百度浏览器
		isSougou: /metasr/.test(UserAgent), // 搜狗浏览器
		isChrome: /chrome/.test(UserAgent.substr(-33, 6)), // Chrome浏览器
		isFirefox: /firefox/.test(UserAgent), // 火狐浏览器
		isOpera: /opera/.test(UserAgent), // Opera浏览器
		isSafire: /safari/.test(UserAgent), // safire浏览器
		isQQ: /qqbrowser/.test(UserAgent)//qq浏览器
    };
  })()
}


/**
 * 操作系统类型获取
 */
function getOS() {
	var sUserAgent = navigator.userAgent;
	var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
	var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel"); if (isMac) 
	return "mac,0";
	var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
	if (isUnix) return "unix,0";
	var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
	if (isLinux) return "linux,0";
	if (isWin) {
		var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
		if (isWin2K) return "windows,2000";
		var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
		if (isWinXP) return "windows,XP";
		var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
		if (isWin2003) return "windows,2003";
		var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
		if (isWinVista) return "windows,vista"; 
		var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
		if (isWin7) return "windows,7";
		var isWin8 = sUserAgent.indexOf("Windows NT 6.2") > -1 || sUserAgent.indexOf("Windows 8") > -1;
		if (isWin8) return "windows,8";
		var isWin81 = sUserAgent.indexOf("Windows NT 6.3") > -1 || sUserAgent.indexOf("Windows 8.1") > -1;
		if (isWin81) return "windows,8.1";
		var isWin10 = sUserAgent.indexOf("Windows NT 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
		if (isWin10) return "windows,10";
	} 
	return "otherOS,0"; 
}

/**
 * 获取ip地址
 */
function getIp(){
	var ip = "";
	$.ajax({
	  url: ip_url,
	  type: 'POST',
	  async: false,
	  dataType: 'text',
	  data: {},
	  success: function(data) {
	    //called when successful
	    eval(data);
	    ip = returnCitySN.cip;
	    
	  }
	});

	return ip;
}

/**
 * 获取物理地址:例如北京
 */
function getAddress(){
	var cname = "";
	$.ajax({
	  url: ip_url,
	  type: 'POST',
	  async: false,
	  dataType: 'text',
	  data: {},
	  success: function(data) {
	    //called when successful
	    eval(data);
	    cname = returnCitySN.cname;
	    
	  }
	});

	return cname;
}

/**
 * 自增计数器
 * @param localStorage_key 需要自增计数的localStorage的key
 */
function value_increment(key){
	if(localStorage[key]){
		localStorage[key] = parseInt(localStorage[key]) + 1;
	}else{
		localStorage[key] = 1;
	}

	//动作事件日志记录
	// 1：点击翻译  2：取消划词
	// 3：开启划词  4：一周不再提示  5：今天内不再提示
	// 6：自动弹出  7：手动弹出
	// 8：资讯一周内不弹出  9：人工翻译  10：点击FAQ  11：点击插件LOGO
	if(key == "log_plugin_translate"){
		//日志记录
		log_collect_plugin_bar(1);
	}
	else if(key == "log_plugin_words_close"){
		log_collect_plugin_bar(2);
	}
	else if(key == "log_plugin_words_open"){
		log_collect_plugin_bar(3);
	}
	else if(key == "log_plugin_config_auto_show_tips_week"){
		log_collect_plugin_bar(4);
	}
	else if(key == "log_plugin_config_auto_show_tips_day"){
		log_collect_plugin_bar(5);
	}
	else if(key == "log_plugin_on_off_auto_counter"){
		log_collect_plugin_bar(6);
	}
	else if(key == "log_plugin_on_off_counter"){
		log_collect_plugin_bar(7);
	}
	else if(key == "log_plugin_config_new_info_week"){
		log_collect_plugin_bar(8);
	}

}

/**
 * 获取url中的参数
 */
function get_url_value_by_key(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}
// 这样调用：
//alert(get_url_value_by_key("参数名1"));


/**
 * 日志公共头信息
 */
function get_log_head_info(){
	var log_create_time = new Date().getTime();//时间
	//插件渠道
	var log_channel = localStorage['log_common_info_channel'];

	//插件分发途径
	var log_distribute = localStorage['log_common_info_distribute'];
	
	//插件身份信息标识初始化
	var log_uuid = localStorage['log_common_info_plugin_uuid'];

	//插件版本号初始化
	var log_version = localStorage['log_common_info_version'];

	//浏览器型号初始化
	var log_browser = localStorage['log_common_info_browser'];

	//浏览器型号版本号初始化
	var log_browser_version = localStorage['log_common_info_browser_version'];

	//操作系统型号初始化
	var log_os = localStorage['log_common_info_os_type'];

	//操作系统型号版本号初始化
	var log_os_version = localStorage['log_common_info_os_type_version'];

	//IP地址获取
	var log_ip = localStorage['log_common_info_ip'];

	//地址获取
	var log_address = localStorage['log_common_info_address'];

	//浏览器语言
	var log_sys_lang = localStorage['log_common_info_browser_lang'];

	return log_create_time+"|"+log_os+"|"+log_os_version+"|"+log_browser+"|"+log_browser_version+"|"+log_uuid+"|"+log_ip+"|"+log_address+"|"+log_version+"|"+log_channel+"|"+log_distribute;
}

/**
 * 翻译功能条 - 动作事件日志
 * active_type动作类型
 */
function log_collect_plugin_bar(active_type){
	// active_type动作类型
	// 1：点击翻译  2：取消划词
	// 3：开启划词  4：一周不再提示  5：今天内不再提示
	// 6：自动弹出  7：手动弹出
	// 8：资讯一周内不弹出  9：人工翻译  10：点击FAQ  11：点击插件LOGO
	var log_starttime = new Date().getTime();//开始时间
	var log_endtime = new Date().getTime();//结束时间
	var log_active_type = active_type;//动作类型
	var log_active_num = "1";//动作次数
	localStorage["log_upload_user_active_"+(new Date().getTime())] = 
	"05|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_active_type+"|"+log_active_num;
}

/**
* DES加密/解密
* @Copyright Copyright (c) 2006
* @author Guapo
* @see DESCore
*/

/*
* encrypt the string to string made up of hex
* return the encrypted string
*/
function strEnc(data,firstKey,secondKey,thirdKey){

 var leng = data.length;
 var encData = "";
 var firstKeyBt,secondKeyBt,thirdKeyBt,firstLength,secondLength,thirdLength;
 if(firstKey != null && firstKey != ""){    
   firstKeyBt = getKeyBytes(firstKey);
   firstLength = firstKeyBt.length;
 }
 if(secondKey != null && secondKey != ""){
   secondKeyBt = getKeyBytes(secondKey);
   secondLength = secondKeyBt.length;
 }
 if(thirdKey != null && thirdKey != ""){
   thirdKeyBt = getKeyBytes(thirdKey);
   thirdLength = thirdKeyBt.length;
 }  
 
 if(leng > 0){
   if(leng < 4){
     var bt = strToBt(data);      
     var encByte ;
     if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
       var tempBt;
       var x,y,z;
       tempBt = bt;        
       for(x = 0;x < firstLength ;x ++){
         tempBt = enc(tempBt,firstKeyBt[x]);
       }
       for(y = 0;y < secondLength ;y ++){
         tempBt = enc(tempBt,secondKeyBt[y]);
       }
       for(z = 0;z < thirdLength ;z ++){
         tempBt = enc(tempBt,thirdKeyBt[z]);
       }        
       encByte = tempBt;        
     }else{
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
         var tempBt;
         var x,y;
         tempBt = bt;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !=""){            
           var tempBt;
           var x = 0;
           tempBt = bt;            
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           encByte = tempBt;
         }
       }        
     }
     encData = bt64ToHex(encByte);
   }else{
     var iterator = parseInt(leng/4);
     var remainder = leng%4;
     var i=0;      
     for(i = 0;i < iterator;i++){
       var tempData = data.substring(i*4+0,i*4+4);
       var tempByte = strToBt(tempData);
       var encByte ;
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
         var tempBt;
         var x,y,z;
         tempBt = tempByte;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         for(z = 0;z < thirdLength ;z ++){
           tempBt = enc(tempBt,thirdKeyBt[z]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
           var tempBt;
           var x,y;
           tempBt = tempByte;
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           for(y = 0;y < secondLength ;y ++){
             tempBt = enc(tempBt,secondKeyBt[y]);
           }
           encByte = tempBt;
         }else{
           if(firstKey != null && firstKey !=""){                      
             var tempBt;
             var x;
             tempBt = tempByte;
             for(x = 0;x < firstLength ;x ++){                
               tempBt = enc(tempBt,firstKeyBt[x]);
             }
             encByte = tempBt;              
           }
         }
       }
       encData += bt64ToHex(encByte);
     }      
     if(remainder > 0){
       var remainderData = data.substring(iterator*4+0,leng);
       var tempByte = strToBt(remainderData);
       var encByte ;
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
         var tempBt;
         var x,y,z;
         tempBt = tempByte;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         for(z = 0;z < thirdLength ;z ++){
           tempBt = enc(tempBt,thirdKeyBt[z]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
           var tempBt;
           var x,y;
           tempBt = tempByte;
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           for(y = 0;y < secondLength ;y ++){
             tempBt = enc(tempBt,secondKeyBt[y]);
           }
           encByte = tempBt;
         }else{
           if(firstKey != null && firstKey !=""){            
             var tempBt;
             var x;
             tempBt = tempByte;
             for(x = 0;x < firstLength ;x ++){
               tempBt = enc(tempBt,firstKeyBt[x]);
             }
             encByte = tempBt;
           }
         }
       }
       encData += bt64ToHex(encByte);
     }                
   }
 }
 return encData;
}

/*
* decrypt the encrypted string to the original string 
*
* return  the original string  
*/
function strDec(data,firstKey,secondKey,thirdKey){
 var leng = data.length;
 var decStr = "";
 var firstKeyBt,secondKeyBt,thirdKeyBt,firstLength,secondLength,thirdLength;
 if(firstKey != null && firstKey != ""){    
   firstKeyBt = getKeyBytes(firstKey);
   firstLength = firstKeyBt.length;
 }
 if(secondKey != null && secondKey != ""){
   secondKeyBt = getKeyBytes(secondKey);
   secondLength = secondKeyBt.length;
 }
 if(thirdKey != null && thirdKey != ""){
   thirdKeyBt = getKeyBytes(thirdKey);
   thirdLength = thirdKeyBt.length;
 }
 
 var iterator = parseInt(leng/16);
 var i=0;  
 for(i = 0;i < iterator;i++){
   var tempData = data.substring(i*16+0,i*16+16);    
   var strByte = hexToBt64(tempData);    
   var intByte = new Array(64);
   var j = 0;
   for(j = 0;j < 64; j++){
     intByte[j] = parseInt(strByte.substring(j,j+1));
   }    
   var decByte;
   if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
     var tempBt;
     var x,y,z;
     tempBt = intByte;
     for(x = thirdLength - 1;x >= 0;x --){
       tempBt = dec(tempBt,thirdKeyBt[x]);
     }
     for(y = secondLength - 1;y >= 0;y --){
       tempBt = dec(tempBt,secondKeyBt[y]);
     }
     for(z = firstLength - 1;z >= 0 ;z --){
       tempBt = dec(tempBt,firstKeyBt[z]);
     }
     decByte = tempBt;
   }else{
     if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
       var tempBt;
       var x,y,z;
       tempBt = intByte;
       for(x = secondLength - 1;x >= 0 ;x --){
         tempBt = dec(tempBt,secondKeyBt[x]);
       }
       for(y = firstLength - 1;y >= 0 ;y --){
         tempBt = dec(tempBt,firstKeyBt[y]);
       }
       decByte = tempBt;
     }else{
       if(firstKey != null && firstKey !=""){
         var tempBt;
         var x,y,z;
         tempBt = intByte;
         for(x = firstLength - 1;x >= 0 ;x --){
           tempBt = dec(tempBt,firstKeyBt[x]);
         }
         decByte = tempBt;
       }
     }
   }
   decStr += byteToString(decByte);
 }      
 return decStr;
}
/*
* chang the string into the bit array
* 
* return bit array(it's length % 64 = 0)
*/
function getKeyBytes(key){
 var keyBytes = new Array();
 var leng = key.length;
 var iterator = parseInt(leng/4);
 var remainder = leng%4;
 var i = 0;
 for(i = 0;i < iterator; i ++){
   keyBytes[i] = strToBt(key.substring(i*4+0,i*4+4));
 }
 if(remainder > 0){
   keyBytes[i] = strToBt(key.substring(i*4+0,leng));
 }    
 return keyBytes;
}

/*
* chang the string(it's length <= 4) into the bit array
* 
* return bit array(it's length = 64)
*/
function strToBt(str){  
 var leng = str.length;
 var bt = new Array(64);
 if(leng < 4){
   var i=0,j=0,p=0,q=0;
   for(i = 0;i<leng;i++){
     var k = str.charCodeAt(i);
     for(j=0;j<16;j++){      
       var pow=1,m=0;
       for(m=15;m>j;m--){
         pow *= 2;
       }        
       bt[16*i+j]=parseInt(k/pow)%2;
     }
   }
   for(p = leng;p<4;p++){
     var k = 0;
     for(q=0;q<16;q++){      
       var pow=1,m=0;
       for(m=15;m>q;m--){
         pow *= 2;
       }        
       bt[16*p+q]=parseInt(k/pow)%2;
     }
   }  
 }else{
   for(i = 0;i<4;i++){
     var k = str.charCodeAt(i);
     for(j=0;j<16;j++){      
       var pow=1;
       for(m=15;m>j;m--){
         pow *= 2;
       }        
       bt[16*i+j]=parseInt(k/pow)%2;
     }
   }  
 }
 return bt;
}

/*
* chang the bit(it's length = 4) into the hex
* 
* return hex
*/
function bt4ToHex(binary) {
 var hex;
 switch (binary) {
   case "0000" : hex = "0"; break;
   case "0001" : hex = "1"; break;
   case "0010" : hex = "2"; break;
   case "0011" : hex = "3"; break;
   case "0100" : hex = "4"; break;
   case "0101" : hex = "5"; break;
   case "0110" : hex = "6"; break;
   case "0111" : hex = "7"; break;
   case "1000" : hex = "8"; break;
   case "1001" : hex = "9"; break;
   case "1010" : hex = "A"; break;
   case "1011" : hex = "B"; break;
   case "1100" : hex = "C"; break;
   case "1101" : hex = "D"; break;
   case "1110" : hex = "E"; break;
   case "1111" : hex = "F"; break;
 }
 return hex;
}

/*
* chang the hex into the bit(it's length = 4)
* 
* return the bit(it's length = 4)
*/
function hexToBt4(hex) {
 var binary;
 switch (hex) {
   case "0" : binary = "0000"; break;
   case "1" : binary = "0001"; break;
   case "2" : binary = "0010"; break;
   case "3" : binary = "0011"; break;
   case "4" : binary = "0100"; break;
   case "5" : binary = "0101"; break;
   case "6" : binary = "0110"; break;
   case "7" : binary = "0111"; break;
   case "8" : binary = "1000"; break;
   case "9" : binary = "1001"; break;
   case "A" : binary = "1010"; break;
   case "B" : binary = "1011"; break;
   case "C" : binary = "1100"; break;
   case "D" : binary = "1101"; break;
   case "E" : binary = "1110"; break;
   case "F" : binary = "1111"; break;
 }
 return binary;
}

/*
* chang the bit(it's length = 64) into the string
* 
* return string
*/
function byteToString(byteData){
 var str="";
 for(i = 0;i<4;i++){
   var count=0;
   for(j=0;j<16;j++){        
     var pow=1;
     for(m=15;m>j;m--){
       pow*=2;
     }              
     count+=byteData[16*i+j]*pow;
   }        
   if(count != 0){
     str+=String.fromCharCode(count);
   }
 }
 return str;
}

function bt64ToHex(byteData){
 var hex = "";
 for(i = 0;i<16;i++){
   var bt = "";
   for(j=0;j<4;j++){    
     bt += byteData[i*4+j];
   }    
   hex+=bt4ToHex(bt);
 }
 return hex;
}

function hexToBt64(hex){
 var binary = "";
 for(i = 0;i<16;i++){
   binary+=hexToBt4(hex.substring(i,i+1));
 }
 return binary;
}

/*
* the 64 bit des core arithmetic
*/

function enc(dataByte,keyByte){  
 var keys = generateKeys(keyByte);    
 var ipByte   = initPermute(dataByte);  
 var ipLeft   = new Array(32);
 var ipRight  = new Array(32);
 var tempLeft = new Array(32);
 var i = 0,j = 0,k = 0,m = 0, n = 0;
 for(k = 0;k < 32;k ++){
   ipLeft[k] = ipByte[k];
   ipRight[k] = ipByte[32+k];
 }    
 for(i = 0;i < 16;i ++){
   for(j = 0;j < 32;j ++){
     tempLeft[j] = ipLeft[j];
     ipLeft[j] = ipRight[j];      
   }  
   var key = new Array(48);
   for(m = 0;m < 48;m ++){
     key[m] = keys[i][m];
   }
   var  tempRight = xor(pPermute(sBoxPermute(xor(expandPermute(ipRight),key))), tempLeft);      
   for(n = 0;n < 32;n ++){
     ipRight[n] = tempRight[n];
   }  
   
 }  
 
 
 var finalData =new Array(64);
 for(i = 0;i < 32;i ++){
   finalData[i] = ipRight[i];
   finalData[32+i] = ipLeft[i];
 }
 return finallyPermute(finalData);  
}

function dec(dataByte,keyByte){  
 var keys = generateKeys(keyByte);    
 var ipByte   = initPermute(dataByte);  
 var ipLeft   = new Array(32);
 var ipRight  = new Array(32);
 var tempLeft = new Array(32);
 var i = 0,j = 0,k = 0,m = 0, n = 0;
 for(k = 0;k < 32;k ++){
   ipLeft[k] = ipByte[k];
   ipRight[k] = ipByte[32+k];
 }  
 for(i = 15;i >= 0;i --){
   for(j = 0;j < 32;j ++){
     tempLeft[j] = ipLeft[j];
     ipLeft[j] = ipRight[j];      
   }  
   var key = new Array(48);
   for(m = 0;m < 48;m ++){
     key[m] = keys[i][m];
   }
   
   var  tempRight = xor(pPermute(sBoxPermute(xor(expandPermute(ipRight),key))), tempLeft);      
   for(n = 0;n < 32;n ++){
     ipRight[n] = tempRight[n];
   }  
 }  
 
 
 var finalData =new Array(64);
 for(i = 0;i < 32;i ++){
   finalData[i] = ipRight[i];
   finalData[32+i] = ipLeft[i];
 }
 return finallyPermute(finalData);  
}

function initPermute(originalData){
 var ipByte = new Array(64);
 for (i = 0, m = 1, n = 0; i < 4; i++, m += 2, n += 2) {
   for (j = 7, k = 0; j >= 0; j--, k++) {
     ipByte[i * 8 + k] = originalData[j * 8 + m];
     ipByte[i * 8 + k + 32] = originalData[j * 8 + n];
   }
 }    
 return ipByte;
}

function expandPermute(rightData){  
 var epByte = new Array(48);
 for (i = 0; i < 8; i++) {
   if (i == 0) {
     epByte[i * 6 + 0] = rightData[31];
   } else {
     epByte[i * 6 + 0] = rightData[i * 4 - 1];
   }
   epByte[i * 6 + 1] = rightData[i * 4 + 0];
   epByte[i * 6 + 2] = rightData[i * 4 + 1];
   epByte[i * 6 + 3] = rightData[i * 4 + 2];
   epByte[i * 6 + 4] = rightData[i * 4 + 3];
   if (i == 7) {
     epByte[i * 6 + 5] = rightData[0];
   } else {
     epByte[i * 6 + 5] = rightData[i * 4 + 4];
   }
 }      
 return epByte;
}

function xor(byteOne,byteTwo){  
 var xorByte = new Array(byteOne.length);
 for(i = 0;i < byteOne.length; i ++){      
   xorByte[i] = byteOne[i] ^ byteTwo[i];
 }  
 return xorByte;
}

function sBoxPermute(expandByte){
 
   var sBoxByte = new Array(32);
   var binary = "";
   var s1 = [
       [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
       [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
       [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
       [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13 ]];

       /* Table - s2 */
   var s2 = [
       [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
       [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
       [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
       [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9 ]];

       /* Table - s3 */
   var s3= [
       [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
       [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
       [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
       [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12 ]];
       /* Table - s4 */
   var s4 = [
       [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
       [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
       [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
       [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14 ]];

       /* Table - s5 */
   var s5 = [
       [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
       [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
       [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
       [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3 ]];

       /* Table - s6 */
   var s6 = [
       [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
       [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
       [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
       [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13 ]];

       /* Table - s7 */
   var s7 = [
       [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
       [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
       [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
       [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]];

       /* Table - s8 */
   var s8 = [
       [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
       [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
       [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
       [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]];
   
   for(m=0;m<8;m++){
   var i=0,j=0;
   i = expandByte[m*6+0]*2+expandByte[m*6+5];
   j = expandByte[m * 6 + 1] * 2 * 2 * 2 
     + expandByte[m * 6 + 2] * 2* 2 
     + expandByte[m * 6 + 3] * 2 
     + expandByte[m * 6 + 4];
   switch (m) {
     case 0 :
       binary = getBoxBinary(s1[i][j]);
       break;
     case 1 :
       binary = getBoxBinary(s2[i][j]);
       break;
     case 2 :
       binary = getBoxBinary(s3[i][j]);
       break;
     case 3 :
       binary = getBoxBinary(s4[i][j]);
       break;
     case 4 :
       binary = getBoxBinary(s5[i][j]);
       break;
     case 5 :
       binary = getBoxBinary(s6[i][j]);
       break;
     case 6 :
       binary = getBoxBinary(s7[i][j]);
       break;
     case 7 :
       binary = getBoxBinary(s8[i][j]);
       break;
   }      
   sBoxByte[m*4+0] = parseInt(binary.substring(0,1));
   sBoxByte[m*4+1] = parseInt(binary.substring(1,2));
   sBoxByte[m*4+2] = parseInt(binary.substring(2,3));
   sBoxByte[m*4+3] = parseInt(binary.substring(3,4));
 }
 return sBoxByte;
}

function pPermute(sBoxByte){
 var pBoxPermute = new Array(32);
 pBoxPermute[ 0] = sBoxByte[15]; 
 pBoxPermute[ 1] = sBoxByte[ 6]; 
 pBoxPermute[ 2] = sBoxByte[19]; 
 pBoxPermute[ 3] = sBoxByte[20]; 
 pBoxPermute[ 4] = sBoxByte[28]; 
 pBoxPermute[ 5] = sBoxByte[11]; 
 pBoxPermute[ 6] = sBoxByte[27]; 
 pBoxPermute[ 7] = sBoxByte[16]; 
 pBoxPermute[ 8] = sBoxByte[ 0]; 
 pBoxPermute[ 9] = sBoxByte[14]; 
 pBoxPermute[10] = sBoxByte[22]; 
 pBoxPermute[11] = sBoxByte[25]; 
 pBoxPermute[12] = sBoxByte[ 4]; 
 pBoxPermute[13] = sBoxByte[17]; 
 pBoxPermute[14] = sBoxByte[30]; 
 pBoxPermute[15] = sBoxByte[ 9]; 
 pBoxPermute[16] = sBoxByte[ 1]; 
 pBoxPermute[17] = sBoxByte[ 7]; 
 pBoxPermute[18] = sBoxByte[23]; 
 pBoxPermute[19] = sBoxByte[13]; 
 pBoxPermute[20] = sBoxByte[31]; 
 pBoxPermute[21] = sBoxByte[26]; 
 pBoxPermute[22] = sBoxByte[ 2]; 
 pBoxPermute[23] = sBoxByte[ 8]; 
 pBoxPermute[24] = sBoxByte[18]; 
 pBoxPermute[25] = sBoxByte[12]; 
 pBoxPermute[26] = sBoxByte[29]; 
 pBoxPermute[27] = sBoxByte[ 5]; 
 pBoxPermute[28] = sBoxByte[21]; 
 pBoxPermute[29] = sBoxByte[10]; 
 pBoxPermute[30] = sBoxByte[ 3]; 
 pBoxPermute[31] = sBoxByte[24];    
 return pBoxPermute;
}

function finallyPermute(endByte){    
 var fpByte = new Array(64);  
 fpByte[ 0] = endByte[39]; 
 fpByte[ 1] = endByte[ 7]; 
 fpByte[ 2] = endByte[47]; 
 fpByte[ 3] = endByte[15]; 
 fpByte[ 4] = endByte[55]; 
 fpByte[ 5] = endByte[23]; 
 fpByte[ 6] = endByte[63]; 
 fpByte[ 7] = endByte[31]; 
 fpByte[ 8] = endByte[38]; 
 fpByte[ 9] = endByte[ 6]; 
 fpByte[10] = endByte[46]; 
 fpByte[11] = endByte[14]; 
 fpByte[12] = endByte[54]; 
 fpByte[13] = endByte[22]; 
 fpByte[14] = endByte[62]; 
 fpByte[15] = endByte[30]; 
 fpByte[16] = endByte[37]; 
 fpByte[17] = endByte[ 5]; 
 fpByte[18] = endByte[45]; 
 fpByte[19] = endByte[13]; 
 fpByte[20] = endByte[53]; 
 fpByte[21] = endByte[21]; 
 fpByte[22] = endByte[61]; 
 fpByte[23] = endByte[29]; 
 fpByte[24] = endByte[36]; 
 fpByte[25] = endByte[ 4]; 
 fpByte[26] = endByte[44]; 
 fpByte[27] = endByte[12]; 
 fpByte[28] = endByte[52]; 
 fpByte[29] = endByte[20]; 
 fpByte[30] = endByte[60]; 
 fpByte[31] = endByte[28]; 
 fpByte[32] = endByte[35]; 
 fpByte[33] = endByte[ 3]; 
 fpByte[34] = endByte[43]; 
 fpByte[35] = endByte[11]; 
 fpByte[36] = endByte[51]; 
 fpByte[37] = endByte[19]; 
 fpByte[38] = endByte[59]; 
 fpByte[39] = endByte[27]; 
 fpByte[40] = endByte[34]; 
 fpByte[41] = endByte[ 2]; 
 fpByte[42] = endByte[42]; 
 fpByte[43] = endByte[10]; 
 fpByte[44] = endByte[50]; 
 fpByte[45] = endByte[18]; 
 fpByte[46] = endByte[58]; 
 fpByte[47] = endByte[26]; 
 fpByte[48] = endByte[33]; 
 fpByte[49] = endByte[ 1]; 
 fpByte[50] = endByte[41]; 
 fpByte[51] = endByte[ 9]; 
 fpByte[52] = endByte[49]; 
 fpByte[53] = endByte[17]; 
 fpByte[54] = endByte[57]; 
 fpByte[55] = endByte[25]; 
 fpByte[56] = endByte[32]; 
 fpByte[57] = endByte[ 0]; 
 fpByte[58] = endByte[40]; 
 fpByte[59] = endByte[ 8]; 
 fpByte[60] = endByte[48]; 
 fpByte[61] = endByte[16]; 
 fpByte[62] = endByte[56]; 
 fpByte[63] = endByte[24];
 return fpByte;
}

function getBoxBinary(i) {
 var binary = "";
 switch (i) {
   case 0 :binary = "0000";break;
   case 1 :binary = "0001";break;
   case 2 :binary = "0010";break;
   case 3 :binary = "0011";break;
   case 4 :binary = "0100";break;
   case 5 :binary = "0101";break;
   case 6 :binary = "0110";break;
   case 7 :binary = "0111";break;
   case 8 :binary = "1000";break;
   case 9 :binary = "1001";break;
   case 10 :binary = "1010";break;
   case 11 :binary = "1011";break;
   case 12 :binary = "1100";break;
   case 13 :binary = "1101";break;
   case 14 :binary = "1110";break;
   case 15 :binary = "1111";break;
 }
 return binary;
}
/*
* generate 16 keys for xor
*
*/
function generateKeys(keyByte){    
 var key   = new Array(56);
 var keys = new Array();  
 
 keys[ 0] = new Array();
 keys[ 1] = new Array();
 keys[ 2] = new Array();
 keys[ 3] = new Array();
 keys[ 4] = new Array();
 keys[ 5] = new Array();
 keys[ 6] = new Array();
 keys[ 7] = new Array();
 keys[ 8] = new Array();
 keys[ 9] = new Array();
 keys[10] = new Array();
 keys[11] = new Array();
 keys[12] = new Array();
 keys[13] = new Array();
 keys[14] = new Array();
 keys[15] = new Array();  
 var loop = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

 for(i=0;i<7;i++){
   for(j=0,k=7;j<8;j++,k--){
     key[i*8+j]=keyByte[8*k+i];
   }
 }    
 
 var i = 0;
 for(i = 0;i < 16;i ++){
   var tempLeft=0;
   var tempRight=0;
   for(j = 0; j < loop[i];j ++){          
     tempLeft = key[0];
     tempRight = key[28];
     for(k = 0;k < 27 ;k ++){
       key[k] = key[k+1];
       key[28+k] = key[29+k];
     }  
     key[27]=tempLeft;
     key[55]=tempRight;
   }
   var tempKey = new Array(48);
   tempKey[ 0] = key[13];
   tempKey[ 1] = key[16];
   tempKey[ 2] = key[10];
   tempKey[ 3] = key[23];
   tempKey[ 4] = key[ 0];
   tempKey[ 5] = key[ 4];
   tempKey[ 6] = key[ 2];
   tempKey[ 7] = key[27];
   tempKey[ 8] = key[14];
   tempKey[ 9] = key[ 5];
   tempKey[10] = key[20];
   tempKey[11] = key[ 9];
   tempKey[12] = key[22];
   tempKey[13] = key[18];
   tempKey[14] = key[11];
   tempKey[15] = key[ 3];
   tempKey[16] = key[25];
   tempKey[17] = key[ 7];
   tempKey[18] = key[15];
   tempKey[19] = key[ 6];
   tempKey[20] = key[26];
   tempKey[21] = key[19];
   tempKey[22] = key[12];
   tempKey[23] = key[ 1];
   tempKey[24] = key[40];
   tempKey[25] = key[51];
   tempKey[26] = key[30];
   tempKey[27] = key[36];
   tempKey[28] = key[46];
   tempKey[29] = key[54];
   tempKey[30] = key[29];
   tempKey[31] = key[39];
   tempKey[32] = key[50];
   tempKey[33] = key[44];
   tempKey[34] = key[32];
   tempKey[35] = key[47];
   tempKey[36] = key[43];
   tempKey[37] = key[48];
   tempKey[38] = key[38];
   tempKey[39] = key[55];
   tempKey[40] = key[33];
   tempKey[41] = key[52];
   tempKey[42] = key[45];
   tempKey[43] = key[41];
   tempKey[44] = key[49];
   tempKey[45] = key[35];
   tempKey[46] = key[28];
   tempKey[47] = key[31];
   switch(i){
     case 0: for(m=0;m < 48 ;m++){ keys[ 0][m] = tempKey[m]; } break;
     case 1: for(m=0;m < 48 ;m++){ keys[ 1][m] = tempKey[m]; } break;
     case 2: for(m=0;m < 48 ;m++){ keys[ 2][m] = tempKey[m]; } break;
     case 3: for(m=0;m < 48 ;m++){ keys[ 3][m] = tempKey[m]; } break;
     case 4: for(m=0;m < 48 ;m++){ keys[ 4][m] = tempKey[m]; } break;
     case 5: for(m=0;m < 48 ;m++){ keys[ 5][m] = tempKey[m]; } break;
     case 6: for(m=0;m < 48 ;m++){ keys[ 6][m] = tempKey[m]; } break;
     case 7: for(m=0;m < 48 ;m++){ keys[ 7][m] = tempKey[m]; } break;
     case 8: for(m=0;m < 48 ;m++){ keys[ 8][m] = tempKey[m]; } break;
     case 9: for(m=0;m < 48 ;m++){ keys[ 9][m] = tempKey[m]; } break;
     case 10: for(m=0;m < 48 ;m++){ keys[10][m] = tempKey[m]; } break;
     case 11: for(m=0;m < 48 ;m++){ keys[11][m] = tempKey[m]; } break;
     case 12: for(m=0;m < 48 ;m++){ keys[12][m] = tempKey[m]; } break;
     case 13: for(m=0;m < 48 ;m++){ keys[13][m] = tempKey[m]; } break;
     case 14: for(m=0;m < 48 ;m++){ keys[14][m] = tempKey[m]; } break;
     case 15: for(m=0;m < 48 ;m++){ keys[15][m] = tempKey[m]; } break;
   }
 }
 return keys;  
}
//end-------------------------------------------------------------------------------------------------------------
/*
function test() {
 
 var msg = "abcdefgh";
 var bt = strToBt(msg);
 
 var key = "12345678";
 var keyB = strToBt(key);
   
 var encByte = enc(bt,keyB);
     
 var enchex  = bt64ToHex(encByte);  
 endata.value=enchex;
 
 var encStr = hexToBt64(enchex);
 alert("encStr="+encStr);
 var eByte = new Array();
 for(m=0;m<encStr.length;m++){
   eByte[m] = parseInt(encStr.substring(m,m+1));
 }
 var decbyte= dec(eByte,keyB)
 var decmsg= byteToString(decbyte);
 alert("decbyte="+decbyte);
 alert("decmsg="+decmsg);  
}*/
function getResult(){
    //待加密字符串
    var str = 'yeekit';
    //第一个参数必须；第二个、第三个参数可选
    var date = new Date();
    var key1 = date.getFullYear()+""+(date.getMonth()+1)+""+date.getDate();  
    var key2 = '_'; 
    var key3 = 'yeekit'; 
    //加密方法        
    var  enResult = strEnc(str,key1,key2,key3);            
    //解密方法
    var deResult = strDec(enResult,key1,key2,key3);
    return enResult;
}
/**
* DES加密/解密
* @Copyright Copyright (c) 2006
* @author Guapo
* @see DESCore
*/

/*
* encrypt the string to string made up of hex
* return the encrypted string
*/
function strEnc(data,firstKey,secondKey,thirdKey){

 var leng = data.length;
 var encData = "";
 var firstKeyBt,secondKeyBt,thirdKeyBt,firstLength,secondLength,thirdLength;
 if(firstKey != null && firstKey != ""){    
   firstKeyBt = getKeyBytes(firstKey);
   firstLength = firstKeyBt.length;
 }
 if(secondKey != null && secondKey != ""){
   secondKeyBt = getKeyBytes(secondKey);
   secondLength = secondKeyBt.length;
 }
 if(thirdKey != null && thirdKey != ""){
   thirdKeyBt = getKeyBytes(thirdKey);
   thirdLength = thirdKeyBt.length;
 }  
 
 if(leng > 0){
   if(leng < 4){
     var bt = strToBt(data);      
     var encByte ;
     if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
       var tempBt;
       var x,y,z;
       tempBt = bt;        
       for(x = 0;x < firstLength ;x ++){
         tempBt = enc(tempBt,firstKeyBt[x]);
       }
       for(y = 0;y < secondLength ;y ++){
         tempBt = enc(tempBt,secondKeyBt[y]);
       }
       for(z = 0;z < thirdLength ;z ++){
         tempBt = enc(tempBt,thirdKeyBt[z]);
       }        
       encByte = tempBt;        
     }else{
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
         var tempBt;
         var x,y;
         tempBt = bt;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !=""){            
           var tempBt;
           var x = 0;
           tempBt = bt;            
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           encByte = tempBt;
         }
       }        
     }
     encData = bt64ToHex(encByte);
   }else{
     var iterator = parseInt(leng/4);
     var remainder = leng%4;
     var i=0;      
     for(i = 0;i < iterator;i++){
       var tempData = data.substring(i*4+0,i*4+4);
       var tempByte = strToBt(tempData);
       var encByte ;
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
         var tempBt;
         var x,y,z;
         tempBt = tempByte;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         for(z = 0;z < thirdLength ;z ++){
           tempBt = enc(tempBt,thirdKeyBt[z]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
           var tempBt;
           var x,y;
           tempBt = tempByte;
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           for(y = 0;y < secondLength ;y ++){
             tempBt = enc(tempBt,secondKeyBt[y]);
           }
           encByte = tempBt;
         }else{
           if(firstKey != null && firstKey !=""){                      
             var tempBt;
             var x;
             tempBt = tempByte;
             for(x = 0;x < firstLength ;x ++){                
               tempBt = enc(tempBt,firstKeyBt[x]);
             }
             encByte = tempBt;              
           }
         }
       }
       encData += bt64ToHex(encByte);
     }      
     if(remainder > 0){
       var remainderData = data.substring(iterator*4+0,leng);
       var tempByte = strToBt(remainderData);
       var encByte ;
       if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
         var tempBt;
         var x,y,z;
         tempBt = tempByte;
         for(x = 0;x < firstLength ;x ++){
           tempBt = enc(tempBt,firstKeyBt[x]);
         }
         for(y = 0;y < secondLength ;y ++){
           tempBt = enc(tempBt,secondKeyBt[y]);
         }
         for(z = 0;z < thirdLength ;z ++){
           tempBt = enc(tempBt,thirdKeyBt[z]);
         }
         encByte = tempBt;
       }else{
         if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
           var tempBt;
           var x,y;
           tempBt = tempByte;
           for(x = 0;x < firstLength ;x ++){
             tempBt = enc(tempBt,firstKeyBt[x]);
           }
           for(y = 0;y < secondLength ;y ++){
             tempBt = enc(tempBt,secondKeyBt[y]);
           }
           encByte = tempBt;
         }else{
           if(firstKey != null && firstKey !=""){            
             var tempBt;
             var x;
             tempBt = tempByte;
             for(x = 0;x < firstLength ;x ++){
               tempBt = enc(tempBt,firstKeyBt[x]);
             }
             encByte = tempBt;
           }
         }
       }
       encData += bt64ToHex(encByte);
     }                
   }
 }
 return encData;
}

/*
* decrypt the encrypted string to the original string 
*
* return  the original string  
*/
function strDec(data,firstKey,secondKey,thirdKey){
 var leng = data.length;
 var decStr = "";
 var firstKeyBt,secondKeyBt,thirdKeyBt,firstLength,secondLength,thirdLength;
 if(firstKey != null && firstKey != ""){    
   firstKeyBt = getKeyBytes(firstKey);
   firstLength = firstKeyBt.length;
 }
 if(secondKey != null && secondKey != ""){
   secondKeyBt = getKeyBytes(secondKey);
   secondLength = secondKeyBt.length;
 }
 if(thirdKey != null && thirdKey != ""){
   thirdKeyBt = getKeyBytes(thirdKey);
   thirdLength = thirdKeyBt.length;
 }
 
 var iterator = parseInt(leng/16);
 var i=0;  
 for(i = 0;i < iterator;i++){
   var tempData = data.substring(i*16+0,i*16+16);    
   var strByte = hexToBt64(tempData);    
   var intByte = new Array(64);
   var j = 0;
   for(j = 0;j < 64; j++){
     intByte[j] = parseInt(strByte.substring(j,j+1));
   }    
   var decByte;
   if(firstKey != null && firstKey !="" && secondKey != null && secondKey != "" && thirdKey != null && thirdKey != ""){
     var tempBt;
     var x,y,z;
     tempBt = intByte;
     for(x = thirdLength - 1;x >= 0;x --){
       tempBt = dec(tempBt,thirdKeyBt[x]);
     }
     for(y = secondLength - 1;y >= 0;y --){
       tempBt = dec(tempBt,secondKeyBt[y]);
     }
     for(z = firstLength - 1;z >= 0 ;z --){
       tempBt = dec(tempBt,firstKeyBt[z]);
     }
     decByte = tempBt;
   }else{
     if(firstKey != null && firstKey !="" && secondKey != null && secondKey != ""){
       var tempBt;
       var x,y,z;
       tempBt = intByte;
       for(x = secondLength - 1;x >= 0 ;x --){
         tempBt = dec(tempBt,secondKeyBt[x]);
       }
       for(y = firstLength - 1;y >= 0 ;y --){
         tempBt = dec(tempBt,firstKeyBt[y]);
       }
       decByte = tempBt;
     }else{
       if(firstKey != null && firstKey !=""){
         var tempBt;
         var x,y,z;
         tempBt = intByte;
         for(x = firstLength - 1;x >= 0 ;x --){
           tempBt = dec(tempBt,firstKeyBt[x]);
         }
         decByte = tempBt;
       }
     }
   }
   decStr += byteToString(decByte);
 }      
 return decStr;
}
/*
* chang the string into the bit array
* 
* return bit array(it's length % 64 = 0)
*/
function getKeyBytes(key){
 var keyBytes = new Array();
 var leng = key.length;
 var iterator = parseInt(leng/4);
 var remainder = leng%4;
 var i = 0;
 for(i = 0;i < iterator; i ++){
   keyBytes[i] = strToBt(key.substring(i*4+0,i*4+4));
 }
 if(remainder > 0){
   keyBytes[i] = strToBt(key.substring(i*4+0,leng));
 }    
 return keyBytes;
}

/*
* chang the string(it's length <= 4) into the bit array
* 
* return bit array(it's length = 64)
*/
function strToBt(str){  
 var leng = str.length;
 var bt = new Array(64);
 if(leng < 4){
   var i=0,j=0,p=0,q=0;
   for(i = 0;i<leng;i++){
     var k = str.charCodeAt(i);
     for(j=0;j<16;j++){      
       var pow=1,m=0;
       for(m=15;m>j;m--){
         pow *= 2;
       }        
       bt[16*i+j]=parseInt(k/pow)%2;
     }
   }
   for(p = leng;p<4;p++){
     var k = 0;
     for(q=0;q<16;q++){      
       var pow=1,m=0;
       for(m=15;m>q;m--){
         pow *= 2;
       }        
       bt[16*p+q]=parseInt(k/pow)%2;
     }
   }  
 }else{
   for(i = 0;i<4;i++){
     var k = str.charCodeAt(i);
     for(j=0;j<16;j++){      
       var pow=1;
       for(m=15;m>j;m--){
         pow *= 2;
       }        
       bt[16*i+j]=parseInt(k/pow)%2;
     }
   }  
 }
 return bt;
}

/*
* chang the bit(it's length = 4) into the hex
* 
* return hex
*/
function bt4ToHex(binary) {
 var hex;
 switch (binary) {
   case "0000" : hex = "0"; break;
   case "0001" : hex = "1"; break;
   case "0010" : hex = "2"; break;
   case "0011" : hex = "3"; break;
   case "0100" : hex = "4"; break;
   case "0101" : hex = "5"; break;
   case "0110" : hex = "6"; break;
   case "0111" : hex = "7"; break;
   case "1000" : hex = "8"; break;
   case "1001" : hex = "9"; break;
   case "1010" : hex = "A"; break;
   case "1011" : hex = "B"; break;
   case "1100" : hex = "C"; break;
   case "1101" : hex = "D"; break;
   case "1110" : hex = "E"; break;
   case "1111" : hex = "F"; break;
 }
 return hex;
}

/*
* chang the hex into the bit(it's length = 4)
* 
* return the bit(it's length = 4)
*/
function hexToBt4(hex) {
 var binary;
 switch (hex) {
   case "0" : binary = "0000"; break;
   case "1" : binary = "0001"; break;
   case "2" : binary = "0010"; break;
   case "3" : binary = "0011"; break;
   case "4" : binary = "0100"; break;
   case "5" : binary = "0101"; break;
   case "6" : binary = "0110"; break;
   case "7" : binary = "0111"; break;
   case "8" : binary = "1000"; break;
   case "9" : binary = "1001"; break;
   case "A" : binary = "1010"; break;
   case "B" : binary = "1011"; break;
   case "C" : binary = "1100"; break;
   case "D" : binary = "1101"; break;
   case "E" : binary = "1110"; break;
   case "F" : binary = "1111"; break;
 }
 return binary;
}

/*
* chang the bit(it's length = 64) into the string
* 
* return string
*/
function byteToString(byteData){
 var str="";
 for(i = 0;i<4;i++){
   var count=0;
   for(j=0;j<16;j++){        
     var pow=1;
     for(m=15;m>j;m--){
       pow*=2;
     }              
     count+=byteData[16*i+j]*pow;
   }        
   if(count != 0){
     str+=String.fromCharCode(count);
   }
 }
 return str;
}

function bt64ToHex(byteData){
 var hex = "";
 for(i = 0;i<16;i++){
   var bt = "";
   for(j=0;j<4;j++){    
     bt += byteData[i*4+j];
   }    
   hex+=bt4ToHex(bt);
 }
 return hex;
}

function hexToBt64(hex){
 var binary = "";
 for(i = 0;i<16;i++){
   binary+=hexToBt4(hex.substring(i,i+1));
 }
 return binary;
}

/*
* the 64 bit des core arithmetic
*/

function enc(dataByte,keyByte){  
 var keys = generateKeys(keyByte);    
 var ipByte   = initPermute(dataByte);  
 var ipLeft   = new Array(32);
 var ipRight  = new Array(32);
 var tempLeft = new Array(32);
 var i = 0,j = 0,k = 0,m = 0, n = 0;
 for(k = 0;k < 32;k ++){
   ipLeft[k] = ipByte[k];
   ipRight[k] = ipByte[32+k];
 }    
 for(i = 0;i < 16;i ++){
   for(j = 0;j < 32;j ++){
     tempLeft[j] = ipLeft[j];
     ipLeft[j] = ipRight[j];      
   }  
   var key = new Array(48);
   for(m = 0;m < 48;m ++){
     key[m] = keys[i][m];
   }
   var  tempRight = xor(pPermute(sBoxPermute(xor(expandPermute(ipRight),key))), tempLeft);      
   for(n = 0;n < 32;n ++){
     ipRight[n] = tempRight[n];
   }  
   
 }  
 
 
 var finalData =new Array(64);
 for(i = 0;i < 32;i ++){
   finalData[i] = ipRight[i];
   finalData[32+i] = ipLeft[i];
 }
 return finallyPermute(finalData);  
}

function dec(dataByte,keyByte){  
 var keys = generateKeys(keyByte);    
 var ipByte   = initPermute(dataByte);  
 var ipLeft   = new Array(32);
 var ipRight  = new Array(32);
 var tempLeft = new Array(32);
 var i = 0,j = 0,k = 0,m = 0, n = 0;
 for(k = 0;k < 32;k ++){
   ipLeft[k] = ipByte[k];
   ipRight[k] = ipByte[32+k];
 }  
 for(i = 15;i >= 0;i --){
   for(j = 0;j < 32;j ++){
     tempLeft[j] = ipLeft[j];
     ipLeft[j] = ipRight[j];      
   }  
   var key = new Array(48);
   for(m = 0;m < 48;m ++){
     key[m] = keys[i][m];
   }
   
   var  tempRight = xor(pPermute(sBoxPermute(xor(expandPermute(ipRight),key))), tempLeft);      
   for(n = 0;n < 32;n ++){
     ipRight[n] = tempRight[n];
   }  
 }  
 
 
 var finalData =new Array(64);
 for(i = 0;i < 32;i ++){
   finalData[i] = ipRight[i];
   finalData[32+i] = ipLeft[i];
 }
 return finallyPermute(finalData);  
}

function initPermute(originalData){
 var ipByte = new Array(64);
 for (i = 0, m = 1, n = 0; i < 4; i++, m += 2, n += 2) {
   for (j = 7, k = 0; j >= 0; j--, k++) {
     ipByte[i * 8 + k] = originalData[j * 8 + m];
     ipByte[i * 8 + k + 32] = originalData[j * 8 + n];
   }
 }    
 return ipByte;
}

function expandPermute(rightData){  
 var epByte = new Array(48);
 for (i = 0; i < 8; i++) {
   if (i == 0) {
     epByte[i * 6 + 0] = rightData[31];
   } else {
     epByte[i * 6 + 0] = rightData[i * 4 - 1];
   }
   epByte[i * 6 + 1] = rightData[i * 4 + 0];
   epByte[i * 6 + 2] = rightData[i * 4 + 1];
   epByte[i * 6 + 3] = rightData[i * 4 + 2];
   epByte[i * 6 + 4] = rightData[i * 4 + 3];
   if (i == 7) {
     epByte[i * 6 + 5] = rightData[0];
   } else {
     epByte[i * 6 + 5] = rightData[i * 4 + 4];
   }
 }      
 return epByte;
}

function xor(byteOne,byteTwo){  
 var xorByte = new Array(byteOne.length);
 for(i = 0;i < byteOne.length; i ++){      
   xorByte[i] = byteOne[i] ^ byteTwo[i];
 }  
 return xorByte;
}

function sBoxPermute(expandByte){
 
   var sBoxByte = new Array(32);
   var binary = "";
   var s1 = [
       [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
       [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
       [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
       [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13 ]];

       /* Table - s2 */
   var s2 = [
       [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
       [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
       [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
       [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9 ]];

       /* Table - s3 */
   var s3= [
       [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
       [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
       [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
       [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12 ]];
       /* Table - s4 */
   var s4 = [
       [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
       [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
       [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
       [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14 ]];

       /* Table - s5 */
   var s5 = [
       [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
       [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
       [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
       [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3 ]];

       /* Table - s6 */
   var s6 = [
       [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
       [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
       [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
       [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13 ]];

       /* Table - s7 */
   var s7 = [
       [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
       [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
       [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
       [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]];

       /* Table - s8 */
   var s8 = [
       [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
       [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
       [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
       [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]];
   
   for(m=0;m<8;m++){
   var i=0,j=0;
   i = expandByte[m*6+0]*2+expandByte[m*6+5];
   j = expandByte[m * 6 + 1] * 2 * 2 * 2 
     + expandByte[m * 6 + 2] * 2* 2 
     + expandByte[m * 6 + 3] * 2 
     + expandByte[m * 6 + 4];
   switch (m) {
     case 0 :
       binary = getBoxBinary(s1[i][j]);
       break;
     case 1 :
       binary = getBoxBinary(s2[i][j]);
       break;
     case 2 :
       binary = getBoxBinary(s3[i][j]);
       break;
     case 3 :
       binary = getBoxBinary(s4[i][j]);
       break;
     case 4 :
       binary = getBoxBinary(s5[i][j]);
       break;
     case 5 :
       binary = getBoxBinary(s6[i][j]);
       break;
     case 6 :
       binary = getBoxBinary(s7[i][j]);
       break;
     case 7 :
       binary = getBoxBinary(s8[i][j]);
       break;
   }      
   sBoxByte[m*4+0] = parseInt(binary.substring(0,1));
   sBoxByte[m*4+1] = parseInt(binary.substring(1,2));
   sBoxByte[m*4+2] = parseInt(binary.substring(2,3));
   sBoxByte[m*4+3] = parseInt(binary.substring(3,4));
 }
 return sBoxByte;
}

function pPermute(sBoxByte){
 var pBoxPermute = new Array(32);
 pBoxPermute[ 0] = sBoxByte[15]; 
 pBoxPermute[ 1] = sBoxByte[ 6]; 
 pBoxPermute[ 2] = sBoxByte[19]; 
 pBoxPermute[ 3] = sBoxByte[20]; 
 pBoxPermute[ 4] = sBoxByte[28]; 
 pBoxPermute[ 5] = sBoxByte[11]; 
 pBoxPermute[ 6] = sBoxByte[27]; 
 pBoxPermute[ 7] = sBoxByte[16]; 
 pBoxPermute[ 8] = sBoxByte[ 0]; 
 pBoxPermute[ 9] = sBoxByte[14]; 
 pBoxPermute[10] = sBoxByte[22]; 
 pBoxPermute[11] = sBoxByte[25]; 
 pBoxPermute[12] = sBoxByte[ 4]; 
 pBoxPermute[13] = sBoxByte[17]; 
 pBoxPermute[14] = sBoxByte[30]; 
 pBoxPermute[15] = sBoxByte[ 9]; 
 pBoxPermute[16] = sBoxByte[ 1]; 
 pBoxPermute[17] = sBoxByte[ 7]; 
 pBoxPermute[18] = sBoxByte[23]; 
 pBoxPermute[19] = sBoxByte[13]; 
 pBoxPermute[20] = sBoxByte[31]; 
 pBoxPermute[21] = sBoxByte[26]; 
 pBoxPermute[22] = sBoxByte[ 2]; 
 pBoxPermute[23] = sBoxByte[ 8]; 
 pBoxPermute[24] = sBoxByte[18]; 
 pBoxPermute[25] = sBoxByte[12]; 
 pBoxPermute[26] = sBoxByte[29]; 
 pBoxPermute[27] = sBoxByte[ 5]; 
 pBoxPermute[28] = sBoxByte[21]; 
 pBoxPermute[29] = sBoxByte[10]; 
 pBoxPermute[30] = sBoxByte[ 3]; 
 pBoxPermute[31] = sBoxByte[24];    
 return pBoxPermute;
}

function finallyPermute(endByte){    
 var fpByte = new Array(64);  
 fpByte[ 0] = endByte[39]; 
 fpByte[ 1] = endByte[ 7]; 
 fpByte[ 2] = endByte[47]; 
 fpByte[ 3] = endByte[15]; 
 fpByte[ 4] = endByte[55]; 
 fpByte[ 5] = endByte[23]; 
 fpByte[ 6] = endByte[63]; 
 fpByte[ 7] = endByte[31]; 
 fpByte[ 8] = endByte[38]; 
 fpByte[ 9] = endByte[ 6]; 
 fpByte[10] = endByte[46]; 
 fpByte[11] = endByte[14]; 
 fpByte[12] = endByte[54]; 
 fpByte[13] = endByte[22]; 
 fpByte[14] = endByte[62]; 
 fpByte[15] = endByte[30]; 
 fpByte[16] = endByte[37]; 
 fpByte[17] = endByte[ 5]; 
 fpByte[18] = endByte[45]; 
 fpByte[19] = endByte[13]; 
 fpByte[20] = endByte[53]; 
 fpByte[21] = endByte[21]; 
 fpByte[22] = endByte[61]; 
 fpByte[23] = endByte[29]; 
 fpByte[24] = endByte[36]; 
 fpByte[25] = endByte[ 4]; 
 fpByte[26] = endByte[44]; 
 fpByte[27] = endByte[12]; 
 fpByte[28] = endByte[52]; 
 fpByte[29] = endByte[20]; 
 fpByte[30] = endByte[60]; 
 fpByte[31] = endByte[28]; 
 fpByte[32] = endByte[35]; 
 fpByte[33] = endByte[ 3]; 
 fpByte[34] = endByte[43]; 
 fpByte[35] = endByte[11]; 
 fpByte[36] = endByte[51]; 
 fpByte[37] = endByte[19]; 
 fpByte[38] = endByte[59]; 
 fpByte[39] = endByte[27]; 
 fpByte[40] = endByte[34]; 
 fpByte[41] = endByte[ 2]; 
 fpByte[42] = endByte[42]; 
 fpByte[43] = endByte[10]; 
 fpByte[44] = endByte[50]; 
 fpByte[45] = endByte[18]; 
 fpByte[46] = endByte[58]; 
 fpByte[47] = endByte[26]; 
 fpByte[48] = endByte[33]; 
 fpByte[49] = endByte[ 1]; 
 fpByte[50] = endByte[41]; 
 fpByte[51] = endByte[ 9]; 
 fpByte[52] = endByte[49]; 
 fpByte[53] = endByte[17]; 
 fpByte[54] = endByte[57]; 
 fpByte[55] = endByte[25]; 
 fpByte[56] = endByte[32]; 
 fpByte[57] = endByte[ 0]; 
 fpByte[58] = endByte[40]; 
 fpByte[59] = endByte[ 8]; 
 fpByte[60] = endByte[48]; 
 fpByte[61] = endByte[16]; 
 fpByte[62] = endByte[56]; 
 fpByte[63] = endByte[24];
 return fpByte;
}

function getBoxBinary(i) {
 var binary = "";
 switch (i) {
   case 0 :binary = "0000";break;
   case 1 :binary = "0001";break;
   case 2 :binary = "0010";break;
   case 3 :binary = "0011";break;
   case 4 :binary = "0100";break;
   case 5 :binary = "0101";break;
   case 6 :binary = "0110";break;
   case 7 :binary = "0111";break;
   case 8 :binary = "1000";break;
   case 9 :binary = "1001";break;
   case 10 :binary = "1010";break;
   case 11 :binary = "1011";break;
   case 12 :binary = "1100";break;
   case 13 :binary = "1101";break;
   case 14 :binary = "1110";break;
   case 15 :binary = "1111";break;
 }
 return binary;
}
/*
* generate 16 keys for xor
*
*/
function generateKeys(keyByte){    
 var key   = new Array(56);
 var keys = new Array();  
 
 keys[ 0] = new Array();
 keys[ 1] = new Array();
 keys[ 2] = new Array();
 keys[ 3] = new Array();
 keys[ 4] = new Array();
 keys[ 5] = new Array();
 keys[ 6] = new Array();
 keys[ 7] = new Array();
 keys[ 8] = new Array();
 keys[ 9] = new Array();
 keys[10] = new Array();
 keys[11] = new Array();
 keys[12] = new Array();
 keys[13] = new Array();
 keys[14] = new Array();
 keys[15] = new Array();  
 var loop = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

 for(i=0;i<7;i++){
   for(j=0,k=7;j<8;j++,k--){
     key[i*8+j]=keyByte[8*k+i];
   }
 }    
 
 var i = 0;
 for(i = 0;i < 16;i ++){
   var tempLeft=0;
   var tempRight=0;
   for(j = 0; j < loop[i];j ++){          
     tempLeft = key[0];
     tempRight = key[28];
     for(k = 0;k < 27 ;k ++){
       key[k] = key[k+1];
       key[28+k] = key[29+k];
     }  
     key[27]=tempLeft;
     key[55]=tempRight;
   }
   var tempKey = new Array(48);
   tempKey[ 0] = key[13];
   tempKey[ 1] = key[16];
   tempKey[ 2] = key[10];
   tempKey[ 3] = key[23];
   tempKey[ 4] = key[ 0];
   tempKey[ 5] = key[ 4];
   tempKey[ 6] = key[ 2];
   tempKey[ 7] = key[27];
   tempKey[ 8] = key[14];
   tempKey[ 9] = key[ 5];
   tempKey[10] = key[20];
   tempKey[11] = key[ 9];
   tempKey[12] = key[22];
   tempKey[13] = key[18];
   tempKey[14] = key[11];
   tempKey[15] = key[ 3];
   tempKey[16] = key[25];
   tempKey[17] = key[ 7];
   tempKey[18] = key[15];
   tempKey[19] = key[ 6];
   tempKey[20] = key[26];
   tempKey[21] = key[19];
   tempKey[22] = key[12];
   tempKey[23] = key[ 1];
   tempKey[24] = key[40];
   tempKey[25] = key[51];
   tempKey[26] = key[30];
   tempKey[27] = key[36];
   tempKey[28] = key[46];
   tempKey[29] = key[54];
   tempKey[30] = key[29];
   tempKey[31] = key[39];
   tempKey[32] = key[50];
   tempKey[33] = key[44];
   tempKey[34] = key[32];
   tempKey[35] = key[47];
   tempKey[36] = key[43];
   tempKey[37] = key[48];
   tempKey[38] = key[38];
   tempKey[39] = key[55];
   tempKey[40] = key[33];
   tempKey[41] = key[52];
   tempKey[42] = key[45];
   tempKey[43] = key[41];
   tempKey[44] = key[49];
   tempKey[45] = key[35];
   tempKey[46] = key[28];
   tempKey[47] = key[31];
   switch(i){
     case 0: for(m=0;m < 48 ;m++){ keys[ 0][m] = tempKey[m]; } break;
     case 1: for(m=0;m < 48 ;m++){ keys[ 1][m] = tempKey[m]; } break;
     case 2: for(m=0;m < 48 ;m++){ keys[ 2][m] = tempKey[m]; } break;
     case 3: for(m=0;m < 48 ;m++){ keys[ 3][m] = tempKey[m]; } break;
     case 4: for(m=0;m < 48 ;m++){ keys[ 4][m] = tempKey[m]; } break;
     case 5: for(m=0;m < 48 ;m++){ keys[ 5][m] = tempKey[m]; } break;
     case 6: for(m=0;m < 48 ;m++){ keys[ 6][m] = tempKey[m]; } break;
     case 7: for(m=0;m < 48 ;m++){ keys[ 7][m] = tempKey[m]; } break;
     case 8: for(m=0;m < 48 ;m++){ keys[ 8][m] = tempKey[m]; } break;
     case 9: for(m=0;m < 48 ;m++){ keys[ 9][m] = tempKey[m]; } break;
     case 10: for(m=0;m < 48 ;m++){ keys[10][m] = tempKey[m]; } break;
     case 11: for(m=0;m < 48 ;m++){ keys[11][m] = tempKey[m]; } break;
     case 12: for(m=0;m < 48 ;m++){ keys[12][m] = tempKey[m]; } break;
     case 13: for(m=0;m < 48 ;m++){ keys[13][m] = tempKey[m]; } break;
     case 14: for(m=0;m < 48 ;m++){ keys[14][m] = tempKey[m]; } break;
     case 15: for(m=0;m < 48 ;m++){ keys[15][m] = tempKey[m]; } break;
   }
 }
 return keys;  
}
//end-------------------------------------------------------------------------------------------------------------
/*
function test() {
 
 var msg = "abcdefgh";
 var bt = strToBt(msg);
 
 var key = "12345678";
 var keyB = strToBt(key);
   
 var encByte = enc(bt,keyB);
     
 var enchex  = bt64ToHex(encByte);  
 endata.value=enchex;
 
 var encStr = hexToBt64(enchex);
 alert("encStr="+encStr);
 var eByte = new Array();
 for(m=0;m<encStr.length;m++){
   eByte[m] = parseInt(encStr.substring(m,m+1));
 }
 var decbyte= dec(eByte,keyB)
 var decmsg= byteToString(decbyte);
 alert("decbyte="+decbyte);
 alert("decmsg="+decmsg);  
}*/
function getResult(){
    //待加密字符串
    var str = 'yeekit';
    //第一个参数必须；第二个、第三个参数可选
    var date = new Date();
    var key1 = date.getFullYear()+""+(date.getMonth()+1)+""+date.getDate();  
    var key2 = '_'; 
    var key3 = 'yeekit'; 
    //加密方法        
    var  enResult = strEnc(str,key1,key2,key3);            
    //解密方法
    var deResult = strDec(enResult,key1,key2,key3);
    return enResult;
}
//-----------------------------------------Background级别工具类代码(所有background脚本都可用)end-------------------------------------------