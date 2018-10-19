//接口主机头
//var httphostname = "http://192.168.102.12:8080/yeecloud_officalwebsite";
var httphostname = "http://web.yeekit.com";
localStorage["httphostname"] = httphostname;

//从Chrome Extenstion V2开始，html内的任何js代码都不允许执行。
//解决方案就是,把所有的脚本都放到js里,然后在插件里调用
//该脚本服务于config.html用户自定义配置插件

//初始化匿名函数
$(function(){
  //页面bottom渲染
  render_bottom();
  //绑定事件给配置页面
  bind_event();
  //渲染初始化配置信息到配置页面
  init_config2page();
});

//页面bottom渲染
function render_bottom(){
	document.onreadystatechange = src_loading();
}
//iframe的src属性置入
function src_loading(){
	var httphostname = localStorage["httphostname"];//主机头
	var src = httphostname + "/yeekit_translate_url/yeekit_plugin_bottom_iframe.html";
	$("#bottom_iframe").attr("src",src);
}

//绑定事件
function bind_event(){

  //用户偏好语言设置
  $("#config_target_language").on({
    change:function(){
      var languageType = $("#config_target_language option:selected").val();
      if(languageType != null){
        localStorage["config_target_language"] = languageType;
      }
    }
  });




}

//每次页面打开时初始化配置信息到页面
function init_config2page(){

  //偏好语言
  config_target_language_init();
  
  //自动识别弹出提醒
  config_auto_show_tips_init();

  //最新资讯消息
  config_new_info_init();
}


//偏好语言设置,从缓存读取语种列表然后将偏好语言置于首位
function config_target_language_init(){

  var plugin_language_type = localStorage["plugin_language_type"];
  if(plugin_language_type !=null ){
    var langList = plugin_language_type.split(",");

    if(langList != null && langList.length > 0){
      
      $("#config_target_language").empty();
      
      //得到偏好语言
      var config_target_language = localStorage["config_target_language"];
      for(var i = 0; i < langList.length; i++){
        var langCode = langList[i].split("_")[0];
        if(langCode == config_target_language){//得到偏好语言的langName
          var langName = langList[i].split("_")[1];
          $("#config_target_language").append("<option value='"+langCode+"'>"+langName+"</option>");
        }
      }

      //将除偏好语言之外的其它语言排在后面
      for(var i = 0; i < langList.length; i++){
        var langCode = langList[i].split("_")[0];
        var langName = langList[i].split("_")[1];
        if(langCode != config_target_language){
          $("#config_target_language").append("<option value='"+langCode+"'>"+langName+"</option>");  
        }
        
      }
    
    }
    
  }
}


//自动识别弹出提醒
function  config_auto_show_tips_init(){
  var config_auto_show_tips = localStorage["config_auto_show_tips"].split("_");
  $(".check_box").attr("check","false");
  $(".check_box").attr("src","images/unchecked.png");
  var currEle = $("img[name=config_auto_show_tips][mark="+config_auto_show_tips[0]+"]");
  currEle.attr("check","true");
  currEle.attr("src","images/checked.png");
}

//最新资讯消息
function  config_new_info_init(){
  var config_new_info = localStorage["config_new_info"].split("_");
  $(".check_box1").attr("check","false");
  $(".check_box1").attr("src","images/unchecked.png");
  var currEle = $("img[name=config_new_info][mark="+config_new_info[0]+"]");
  currEle.attr("check","true");
  currEle.attr("src","images/checked.png");

}

//radio选择效果

$(function(){
	function radios(className){
		var radios = $(className);
		radios.bind("click",function(){
			var src = $(this).attr("src");
			if(src == "images/checked.png"){
				return false;
			}else {
				radios.attr("src","images/unchecked.png");
				$(this).attr("src","images/checked.png");
			}
	      //给被选中的设置html属性，同级兄弟元素去掉属性
	      radios.attr("check","false");
	      $(this).attr("check","true");
	      
	      
	      //自动识别弹出提醒
	      if($(this).attr("name") == "config_auto_show_tips"){	    	  
	    	  var config_auto_show_tips = $("img[name=config_auto_show_tips][check=true]").attr("mark");
	    	  if(config_auto_show_tips != null){
	    		  if(config_auto_show_tips == 1){
	    			  localStorage["config_auto_show_tips"] = config_auto_show_tips+"_1";
	    		  }else{
	    			  localStorage["config_auto_show_tips"] = config_auto_show_tips+"_"+(new Date().getTime());
	    			  
	    			  //操作量日志记录
	    			  if(config_auto_show_tips == 2){
	    				  value_increment("log_plugin_config_auto_show_tips_day");//点击一天不弹计数
	    			  }else{
	    				  value_increment("log_plugin_config_auto_show_tips_week");//点击一周不弹计数
	    			  }
	    		  }
	    		  
	    	  }
	      }else if($(this).attr("name") == "config_new_info"){
	    	  var config_new_info = $("img[name=config_new_info][check=true]").attr("mark");
	          if(config_new_info != null){
	            if(config_new_info == 1){
	              localStorage["config_new_info"] = config_new_info+"_1";
	            }else{
	              localStorage["config_new_info"] = config_new_info+"_"+(new Date().getTime());

	              //日志记录
	              value_increment("log_plugin_config_new_info_week");//点击一周不弹计数
	            }
	          }
	      }

		});	
	}
	radios(".check_box");
	radios(".check_box1");
});


//--------------------------------------------自定义配置日志收集独立服务层start------------------------------------------------
//日志上报接口
var log_upload_url = httphostname + "/log/langlog";

var headers_suffix = "_TWGDH";

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

//调用方法上传日志
task_log_upload();
}




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
  data: {
    log:log
  },
  success:function(data){
    
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
// var tasksec = 5;//每五分上报一次
// var si = setInterval(function(){
  log_collect_machining_upload();
// }, 1000 * tasksec);
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
//--------------------------------------------自定义配置日志收集独立服务层start------------------------------------------------


