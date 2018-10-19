//日志处理工具（background JavaScript）

//日志上报接口在setup_init.js中定义


//日志上传定时任务
task_log_upload();



/**
 * 日志上报
 */
function log_upload(loglist){
	var log = "";
	$.each(loglist,function(key,value){
		log += ","+value;
	});
	log = log.substr(1);
	$.ajax({
		url: log_upload_url,
		headers: {
            "access_token":getResult()
        },
		type: 'POST',
		async: 'true',
		dataType: 'json',
		data: {
			log:log
		},
		success:function(data){
			//上报完毕后删除日志
			log_clear(loglist);
		}
	});
	//上报完毕后删除日志
	log_clear(loglist);
	
}

/**
 * 对于上报后的日志清理
 */
function log_clear(loglist){

	$.each(loglist,function(key,value){
		localStorage.removeItem(key);
	});
	
}

/**
 * 日志上传定时任务
 */
function task_log_upload(){
	var tasksec = 5;//每五分上报一次
	var si = setInterval(function(){
		log_collect_machining_upload();
	}, 1000 * tasksec);
}

/**
 * 语种判断/文字翻译/用户动作/安装  等日志
 * 日志上报方法
 */
function log_collect_machining_upload(){

	for(var i=0;i<localStorage.length;i++){
		//key(i)获得相应的键，再用getItem()方法获得对应的值
		//document.write(localStorage.key(i)+ " : " + localStorage.getItem(localStorage.key(i)) + "<br>");
		var key = localStorage.key(i);
		var loglist = {};
		if(key.indexOf("log_upload") > -1){
			var value = localStorage.getItem(localStorage.key(i));
			loglist[key] = value;
			// console.log(value);
		}
		// console.log(key);
		//调用接口,上传日志
		var isEmptyByLogList = $.isEmptyObject(loglist);
		if(loglist != null && !isEmptyByLogList){
			// console.log("开始上传日志");
			// console.log(loglist);
			log_upload(loglist);
		}
		
	}
}