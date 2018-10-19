//语种识别服务,翻译服务等
// var iphost="http://192.168.17.50:8080";//yeek
// var iphost="http://192.168.17.140:8080";
// var iphost="http://192.168.16.141:8091";//yeek
// var iphost="http://183.196.88.54:20039";//公司测试环境
var iphost="http://web.yeekit.com"
var getSourceURL = httphostname+"/plugin/lang";//语种判断接口
var transURL = httphostname+"/plugin/translate";//翻译接口
// var img_translate_url=httphostname+"/plugin/imgTranslate";//图片翻译接口
var img_translate_url=iphost+"/plugin/imgTranslate";
var add_collection=iphost+"/collect/insert"//点击加入收藏夹接口
var collectionURL=iphost+"/collect/query" //查询收藏夹功能
var del_collection=iphost+"/collect/delete"//删除收藏夹功能
var save_collection=iphost+"/collect/update"//修改收藏夹功能
var registe=iphost+"/ykuser/regist"//注册接口
var yklogin=iphost+"/ykuser/login"//登录接口
var code=iphost+"/ykuser/send/sendYeecloudCode"//发送译云券码
var checkuser=iphost+"/ykuser/regist/checkUser"//验证用户是否存在
var send_pcode=iphost+"/ykuser/send/sendMessage"//发送验证码
var send_email=iphost+"/ykuser/send/sendEmail"//邮箱验证码
var yzcode=iphost+"/ykuser/verifycode"//验证码验证
var loginout=iphost+"/ykUser/logout"//退出登录
var loginstats=iphost+"/ykUser/islogin"//登陆状态验证


var backPWD=iphost+"/ykUser/verifycode"
var savepwd=iphost+"/ykUser/savepwd"
var sentMessage=iphost+"/label/getLabel";
var aotuInfo=iphost+"/info/aotuInfo";
/**
 * 监听来自content script 的动作请求
 */
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	

	var action = request.action;

	if(action == "lang_type_action"){//语种识别请求
		sendResponse({"lang_type":get_lang_type(request)});
	}
	else if(action == "translate_action"){//划词翻译服务请求
		sendResponse({"text":translate(request)});
	}
	else if(action == "list_translate_action"){//网页翻译服务请求
		sendResponse({"data":list_translate(request)});
	}else if(action == "IMG_TRANSLATE"){
		sendResponse({"img_data":img_translate(request)})
	}else if(action == "add_collect"){
		sendResponse({"addCollect":addCollect(request)})
	}else if(action == "seeCollect"){
		sendResponse({"seeCollect":seeCollect(request)})
	}else if(action =="SAVEMARK"){
		sendResponse({"savemark":savemark(request)})
	}else if(action == "REMOVEMARK"){
		sendResponse({"removemark":removemark(request)})
	}else if(action =="REGINFO"){
		sendResponse({"reginfo":reg(request)})
	}else if(action == "GET_CODE"){
		sendResponse({"checkInfo":checkUser(request)})
	}else if(action == "SEND_CODE"){
		sendResponse({"codeInfo":sendcode(request)})
	}else if(action == "SEND_PCODE"){
		sendResponse({"codeInfo":sendpcode(request)})
	}else if(action == "LOGIN_ACTION"){
		sendResponse({"login":login(request)})
			// auto_info(request)
		// sendResponse({"autoinfo":auto_info(request)})
	}else if(action=="AUTO_PUSH"){
		auto_info(request)
	}else if(action == "BACKCODE_ACTION"){
		sendResponse({"checkInfo":backcode(request)})
	}else if(action == "LOGIN_STATS"){
		sendResponse({"login_stats":loginStats(request)})
	}else if(action=="LOGIN_OUT"){
		sendResponse({"login_stats":loginOut(request)})
	}else if(action == "back_password"){
		sendResponse({"back_pwd":backPwd(request)})
	}else if(action == "SAVE_PWD"){
		sendResponse({"save_pwd":savePwd(request)})
	}else if(action == "SEND_TEXT_STR"){
		if(localStorage["userId"]!=""){
			send_message(request.data,request.language);
		}
	}

});
// 登陆推送
function auto_info(request){
	var backResult=""
	$.ajax({
	  url: aotuInfo,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data:{
	  	userid:localStorage["userId"],
	  	lastDate:""
	  },
	  success: function(data) {

	    //called when successful
	    if(data != null){
			backResult = data;

	    }
	    
	  }
	});
	return backResult;
}
// 发送页面内容到后台
function send_message(data,lang){
	$.ajax({
	  url: sentMessage,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: true,
	  dataType: 'json',
	  data:{
	  	content:data,
	  	language:lang,
	  	userid:localStorage["userId"]
	  },
	  success: function(data) {	    
	  }
	});
}
// 保存密码
function savePwd(request){
	var backResult=""
	$.ajax({
	  url: savepwd,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.data,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			backResult = data;

	    }
	    
	  }
	});
	return backResult;
}
// 找回密码
function backPwd(request){
	var backResult=""
	$.ajax({
	  url: backPWD,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.data,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			backResult = data;

	    }
	    
	  }
	});
	return backResult;
}
// 找回密码验证码
function backcode(request){
	var backResult=""
	$.ajax({
	  url: checkuser,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.data,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			backResult = data;

	    }
	    
	  }
	});
	return backResult;
}
// 登陆状态
loginStats()
function loginStats(request){
	var statsResult=""
	$.ajax({
	  url: loginstats,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  success: function(data) {

	    //called when successful
	    if(data != null){
			statsResult = data;

			if(statsResult.code==1){
				localStorage["userName"]=statsResult.data.userName;
				localStorage["login_stat"]=true;
				localStorage["userId"]=statsResult.data.id;
			}else{
				localStorage["login_stat"]=false;
				localStorage["userName"]="";
				localStorage["userId"]="";
			}


	    }
	    
	  }
	});
	return statsResult;
}
// 退出登陆
function loginOut(request){
	var statsResult=""
	$.ajax({
	  url: loginout,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  success: function(data) {

	    //called when successful
	    if(data != null){
			statsResult = data;
			localStorage["userId"]=""
			localStorage["login_stat"]=false;
	    }
	    
	  }
	});
	return statsResult;
}
// 发送验证码
function sendcode(request){
		var sendResult=""
	$.ajax({
	  url: send_email,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.obj,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			sendResult = data;

	    }
	    
	  }
	});
	return sendResult;
}
function sendpcode(request){
		var sendpResult=""
	$.ajax({
	  url: send_pcode,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.obj,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			sendpResult = data;

	    }
	    
	  }
	});
	return sendpResult;
}
function login(request){
	var loginResult=""
	$.ajax({
	  url: yklogin,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.data,
	  success: function(data) {
	    //called when successful
	    if(data.code == 1){
			loginResult = data;
			localStorage["userId"]=loginResult.data.id;
	    }else{
	    	loginResult = data;
	    }
	    
	  }
	});
	return loginResult;
}
// 检查用户是否存在
function checkUser(request){
	var checkresult=""
	var tdata=request.obj.phone||request.obj.email;
	$.ajax({
	  url: checkuser,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.obj,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			checkresult = data;

			//文字翻译 - 日志记录
			// var log_endtime = new Date().getTime();//结束时间
			// var log_sec = log_endtime - log_starttime;//耗时
		 //  	var log_website = request.website;//网站
		 //  	var log_weburl = request.weburl;//网址
		 //  	var log_trans_type = "2";//1全文2划词3网页
		 //  	var log_translate_id = translateId;//翻译id
		 //  	var log_sour_lang = sour;//源语言
		 //  	var log_tar_lang = tar;//目标语言
		 //  	var log_text_length = text.length;//字数
		 //  	localStorage["log_upload_word_trans_"+(new Date().getTime())] = 
		 //  	"04|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_sec+"|"+log_website+"|"+log_weburl+"|"+
		 //  	log_trans_type+"|"+log_translate_id+"|"+log_sour_lang+"|"+log_tar_lang+"|"+log_text_length;
	    }
	    
	  }
	});
	return checkresult;
}
// 注册
function reg(request){
	var reg_info="";
	$.ajax({
	  url: registe,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: request.obj,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			reg_info = data;

			
	    }
	    
	  }
	});
	return reg_info;
}
function addCollect(request){
	var collect_result={};
	var srcl = request.src;
	var tgtl = request.tgt;
	var userid =request.userid;
	var cttitle=request.titleName;
	var cturl=request.weburl;
	var log_starttime = new Date().getTime();//开始时间
	$.ajax({
	  url: add_collection,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  data:{
	  	ctSrcl : srcl,
	  	ctTgtl : tgtl,
	  	userid:localStorage["userId"],
	  	ctTitle:cttitle,
	  	ctUrl:cturl,
	  	ctIco:request.website
	  },
	  success: function(data) {
			collect_result = data;	
	  }
	});
	return collect_result;
}
// 查看书签
function seeCollect(request){
	var see_result={};
	var userid =request.userid;
	var log_starttime = new Date().getTime();//开始时间
	$.ajax({
	  url: collectionURL,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  data:{
	  	userid:localStorage["userId"],
	  	ctUrl:request.ctUrl? request.ctUrl:""
	  },
	  success: function(data) {
			see_result = data;	
	  }
	});
	return see_result;
}
//删除书签
function removemark(request){
	
	var remove_result={};
	$.ajax({
	  url: del_collection,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  data:request.data,
	  success: function(data) {
			remove_result = data;
					
	  }
	});
	return remove_result;
}
// 更新书签
function savemark(request){  
	var save_result={};
	$.ajax({
	  url: save_collection,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  data:request.data,
	  success: function(data) {
			save_result = data;
	  }
	});
	return save_result;
}
/**
 * 语种判断接口
 * log_开头的变量为日志收集所用变量
 */
function get_lang_type(request){
	var log_starttime = new Date().getTime();//请求开始时间

	var value = request.lang_text;
	value = encodeURI(encodeURI(value));
	var sourceLang = "";
	$.ajax({
	  url: getSourceURL,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,//同步
	  dataType: 'json',
	  data: {s:value},
	  success: function(data) {
	    //called when successful
	    if(data != null && data.code == 1){
	    	sourceLang = data.data;

	    	//日志记录
			var log_endtime = new Date().getTime();//请求结束时间
		  	var log_sec = log_endtime - log_starttime;//请求耗时
		  	var log_website = request.website;//网站
		  	var log_weburl = request.weburl;//网址
		  	var log_num = 1;//请求次数
		  	var log_web_lang = data.data;//源语言(网页语言)
		  	var log_sys_lang = localStorage['log_common_info_browser_lang'];//系统语言(浏览器的语言)
			localStorage["log_upload_lang_judge_"+(new Date().getTime())] = 
			"03|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_sec+"|"+log_website+"|"+log_weburl+"|"+log_num+"|"+log_web_lang+"|"+log_sys_lang;
	    }
	    
	  }
	});
   return sourceLang;
}


/**
 * 划词翻译接口
 * log_开头的变量为日志收集所用变量
 */
function translate(request){
	var translateId = request.translateId;

	var sour = request.sour;
	var tar  = request.tar;
	var text = request.text;
	
	var response = "";

	var data_dict = {"srcl":sour,"tgtl":tar,"word":text};
	var log_starttime = new Date().getTime();//开始时间
	$.ajax({
	  url: transURL,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  async: false,
	  dataType: 'json',
	  data: data_dict,
	  success: function(data) {

	    //called when successful
	    if(data != null){
			response = data.data;

			//文字翻译 - 日志记录
			var log_endtime = new Date().getTime();//结束时间
			var log_sec = log_endtime - log_starttime;//耗时
		  	var log_website = request.website;//网站
		  	var log_weburl = request.weburl;//网址
		  	var log_trans_type = "2";//1全文2划词3网页
		  	var log_translate_id = translateId;//翻译id
		  	var log_sour_lang = sour;//源语言
		  	var log_tar_lang = tar;//目标语言
		  	var log_text_length = text.length;//字数
		  	localStorage["log_upload_word_trans_"+(new Date().getTime())] = 
		  	"04|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_sec+"|"+log_website+"|"+log_weburl+"|"+
		  	log_trans_type+"|"+log_translate_id+"|"+log_sour_lang+"|"+log_tar_lang+"|"+log_text_length;
	    }
	    
	  }
	});
	

	return response;
	
}
// 图片翻译
function img_translate(request){
	var img_translate_result={};
	var src = request.src;
	var tgt = request.tgt;
	var imgURL =request.url;
	var img_result="";
	var log_starttime = new Date().getTime();//开始时间
	$.ajax({
	  url: img_translate_url,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  data:{
	  	srcl : src,
	  	tgtl : tgt,
	  	url : imgURL
	  },
	  success: function(data) {
			img_result = data;
			//文字翻译 - 日志记录
			var log_endtime = new Date().getTime();//结束时间
			var log_sec = log_endtime - log_starttime;//耗时
		  	var log_website = request.website;//网站
		  	var log_weburl = request.weburl;//网址
		  	var log_sour_lang = src;//源语言
		  	var log_tar_lang = tgt;//目标语言
		  	// localStorage["log_upload_word_trans_"+(new Date().getTime())] = 
		  	// "04|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_sec+"|"+log_website+"|"+log_weburl+"|"+
		  	// log_trans_type+"|"+log_translate_id+"|"+log_sour_lang+"|"+log_tar_lang+"|"+log_text_length;		
	  }
	});
	return img_result;
}
// 收藏书签

/**
 * 网页批量翻译接口
 */
function list_translate(request){
	var translateId = request.translateId;


	var translation_result = {};

	var src = request.src;
	var tgt = request.tgt;
	var texts = request.texts;
	
	var text_length = texts.length;
	
	var log_starttime = new Date().getTime();//开始时间
	$.ajax({
	  url: transURL,
	  headers: {
            "access_token":getResult()
      },
	  type: 'POST',
	  dataType: 'json',
	  async:false,
	  traditional: true, 
	  data:{
	  	srcl : src,
	  	tgtl : tgt,
	  	word : texts
	  },
	  success: function(data) {
			translation_result = data;


			//文字翻译 - 日志记录
			var log_endtime = new Date().getTime();//结束时间
			var log_sec = log_endtime - log_starttime;//耗时
		  	var log_website = request.website;//网站
		  	var log_weburl = request.weburl;//网址
		  	var log_trans_type = "1";//1全文2划词3网页
		  	var log_translate_id = translateId;//翻译id
		  	var log_sour_lang = src;//源语言
		  	var log_tar_lang = tgt;//目标语言
		  	var log_text_length = text_length;//字数
		  	localStorage["log_upload_word_trans_"+(new Date().getTime())] = 
		  	"04|"+get_log_head_info()+"|"+log_starttime+"|"+log_endtime+"|"+log_sec+"|"+log_website+"|"+log_weburl+"|"+
		  	log_trans_type+"|"+log_translate_id+"|"+log_sour_lang+"|"+log_tar_lang+"|"+log_text_length;

		
	  }
	 //  error: function(xhr, textStatus, errorThrown) {
		// var frm = document.getElementById("yeetool");
		// frm.contentWindow.postMessage({
		// action : "YEEKIT_NOT_SUPPORT"
		// }, "*");
	 //  }
	});

	return translation_result;
}