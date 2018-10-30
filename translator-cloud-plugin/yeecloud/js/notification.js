//插件弹出框按钮定义
var buttons = [
	{title: "人工翻译",iconUrl: chrome.runtime.getURL("/images/translate.png")},
	{title: "插件设置",iconUrl: chrome.runtime.getURL("/images/config.png")}
];

//人工翻译链接
var translateUrl = "http://cus.yeecloud.com/yccustomer/ttype?language=zh";

//资讯弹框服务接口
var info_url = httphostname+"/info/queryByNotifications";
var aotuInfo = httphostname+"/info/aotuInfo";
// var info_url = "http://192.168.16.141:8091/info/queryByNotifications";
// var info_url = "http://192.168.17.18:8080/info/queryByNotifications";

//图片接口服务
var image_url = httphostname + "/attachment/download?id=";

//资讯弹框任务id
var notification_timedtask_id;
// 自动推送接口
// var aotuInfo = iphost+"/info/aotuInfo";
// var aotuInfo = "http://192.168.17.18:8080/info/aotuInfo";
// var aotuInfo = "http://192.168.16.141:8091/info/aotuInfo";
//定时任务
timedTask();

//清理临时缓存
function clear(notificationId){
	localStorage.removeItem("cache_info_"+notificationId);
}

//弹框非按钮监听器
chrome.notifications.onClicked.addListener(function(notificationId){
	//资讯弹框点击链接日志记录
	localStorage["log_upload_info_notification_"+(new Date().getTime())] = "08|"+get_log_head_info()+"|"+notificationId;
	//打开资讯链接
	open_info_url(localStorage["cache_info_"+notificationId]);
});

//弹框按钮监听器
chrome.notifications.onButtonClicked.addListener(function(notificationId,btnIndex){
	open_config_url(notificationId,btnIndex);
});

//弹框关闭监听器
chrome.notifications.onClosed.addListener(function(notificationId,byUser){
	localStorage.removeItem("cache_info_"+notificationId);
	clear(notificationId);
});

//打开弹出框中网页超链
function open_info_url(url){
	window.open(url);
}

//打开弹出框中自定义配置插件页面/人工翻译宣传页
function open_config_url(notificationId,btnIndex){
	if(btnIndex == 1){
		//自定义设置
		chrome.tabs.create({ selected: true, url: './config.html' });
	}else{
		//人工翻译
		window.open(translateUrl);
	}
	
}
// ----------------------------------------------------------------------------
// 自动推送
function auto_info(obj){
	var time=localStorage["lastTime"]|| "";
	$.ajax({
	  url: aotuInfo,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  data:{
	  	userid:localStorage["userId"],
	  	tgtl:"",
	  	lastDate:time
	  },
	  success: function(data) {
	  	setTimeout(function(){
				auto_info(localStorage["lastTime"]);
			},1000*6*60*60)
	    //called when successful
	    if(data.code==1){
			notification_box_show_ajax_success(data.data)
			localStorage["lastTime"]=data.data.autoLastTime;
			localStorage["cache_info_"+info.id] = info.infoLink;
	    }	    
			
	  }
	});
}

	if(localStorage["login_stat"]=="true"){
		auto_info();
	}

// ----------------------------------------------------------------------------------------
//桌面通知异步请求(右下角弹框)
function notification_box_show_ajax(){
	//请求服务器最新资讯
	//请求参数：最后一条服务器下发的消息(可以为空,意为该插件从未接收过服务器的消息推送),浏览器信息,用户自定义配置信息
	//最后一条服务器下发的消息  key:id  value:localStorage['cache_last_info_id']  
	//浏览器信息  key:info_browsers value:localStorage['log_common_info_browser']
	//用户自定义弹框配置信息  key:info_user_state  vaule:localStorage['config_new_info']
	//如果请求到了最新资讯,则开始弹框,否则不弹框
	//....
	var time=localStorage["lastDate"]||"";
	$.ajax({
	  url: info_url,
	  type: 'POST',
	  dataType: 'json',
	  headers: {
            "access_token":getResult()
      },
	  data: {
	  	lastDate:time,
	  	info_browsers:localStorage['log_common_info_browser'],
	  	info_user_state:localStorage['config_auto_show_tips'].split("_")[0],
	  	userid:localStorage["userId"]
	  },
	  success: function(data) {
	    //called when successful
	    var info_list = data.data;
	    if(info_list != null){
	    	if(info_list.length > 0){
				for(var i = 0 ; i < info_list.length; i++){
	    			var info = info_list[i];
	    			// console.log(info);
	    			notification_box_show_ajax_success(info);
	    			localStorage["cache_info_"+info.id] = info.infoLink;
	    			localStorage["lastDate"]=info.lastDate;
	    		}
	    	}
	    	
	    }
	  }
	});
}

/**
 * 异步请求成功
 */
function notification_box_show_ajax_success(info){
	//缓存消息超链,用于监听及打开超链
	
	
	//弹框信息装载
	var options =  {
        type: "basic",
        title: info.infoTitle,
        message: info.infoAbs,
        iconUrl: (info.infoIcon==undefined)?"../images/icon.png":image_url + info.infoIcon,
        //items: items,
        buttons: buttons
//        eventTime: new Date().getTime()+(5*1000)//该时间戳决定它将什么时候被创建
    };
    // console.log(info.id);
    // console.log(options);
	chrome.notifications.create(info.id, options, function(notificationId){
		
	});
		// 	//弹框回调
		// var t=setTimeout(function(){
		// 	update_notification(options,info.id);
		// },100);
}
/**
 * 更新弹框中的内容,保证不被浏览器自动关闭弹框
 */
// function update_notification(options,notificationId){
// 	chrome.notifications.update(notificationId, options, function(){
// 		console.log("更新成功");
// 	});
// }

/**
 * 资讯弹框定时任务
 */
function notification_timedtask(){
	// notification_box_execute();
	var tasksec = 60*15;//15分钟请求一次,获取最新资讯

	notification_timedtask_id = setInterval(function() {
		notification_box_execute();

	}, 1000 * tasksec);
}
notification_box_execute();
/**
 * 执行弹框任务-流程控制-配置控制
 */
function notification_box_execute(){
	var config_new_info = localStorage['config_new_info'].split("_");

	if(config_new_info != null){

		if(config_new_info[0] == 1){//用户设置允许,弹!

			//弹框动作
			notification_box_show_ajax();

		}else{//一周不弹,检测一周过了没
			//               周  天   时   分   秒
			var weeklength = 7 * 24 * 60 * 60 * 1000;//得到一周的毫秒长度
			var currentTime = new Date().getTime();//当前时间

			if((currentTime - config_new_info[1]) > weeklength){//超过了一周,弹!
				//弹框动作
				notification_box_show_ajax();
				//弹框OK后顺便把配置项挪到默认选项
				localStorage["config_new_info"] = "1_1";//将用户配置项设置为默认值,随时弹框

			}else{//未超过一周,暂停弹框
				//销毁弹框任务对象
				//window.clearInterval(notification_timedtask_id);
			}

		}
	}else{
		//弹框动作
		notification_box_show_ajax();
	}
}


/**
 * 定时任务
 */
function timedTask(){
	//资讯弹框定时任务
	notification_timedtask();
}
// -------------------二期推送
function pushAdvisory(){
	if(localStorage["userId"]==""){
	}else{
	}
}
pushAdvisory()