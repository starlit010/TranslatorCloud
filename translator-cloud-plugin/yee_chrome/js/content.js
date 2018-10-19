//变量及常量定义
var PLUGIN_SOURCE_LANGUAGE = "";//插件源语言
var PLUGIN_TARGET_LANGUAGE = "";//插件目标语言
var PLUGIN_SELECT_TRANSLATION = "";//划词翻译功能开关标识
var LANGUAGE_TYPE_LIST = {};//语种列表
var LANGUAGE_TYPE_LIST_DEFINED = {"zh":"中文","en":"英文","ru":"俄语","pt":"葡语","fr":"法语","de":"德语","ko":"韩语"};//语种列表拉取失败情况下的默认语种列表
var img_translate_flag=0; //图片翻译开发
//临时变量定义
var total_number_of_content = 0;//网页翻译,翻译字符长度计算
var request_iter = 0;
var sourceMap = {};//查看原文时缓存
var targetMap = {};//查看译文时缓存

var sourceNewObj = {};//查看原文时缓存
var targetNewObj = {};//查看译文时缓存
var loginInfos={}; //登陆信息
var dict = {};
// var transURL = "http://192.168.102.23:8080/front/plugin/translate";//翻译接口
//content script维度监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action=="auto_translate"){
		// change_plugin_bar(1,request);
		login_stats();
		// transBtnClick(request.sour,request.tgt)
		// setTimeout(function(){
		// 	var frm = document.getElementById("yeetool");
		// 			frm.contentWindow.postMessage({
		// 				action:"autoTranslate"
		// 			},"*");
		// },1000)
	}else if(request.action=="aaa"){
		creat_install()
	}

	//插件显示/移除动作监听
	else if (request.action == "action_change_plugin_bar") {

		//恢复最后一次网页缓存信息
		sourceMap = request.sourceMap;
		targetMap = request.targetMap;
		dict = request.dict;

		if(request.PLUGIN_ON_OFF == "on"){
			//显示插件
			change_plugin_bar(1,request);
			
		}else if(request.PLUGIN_ON_OFF == "off"){
			//移除插件
			change_plugin_bar(0,request);
			// 关闭图片翻译功能
		}
		
		//配置翻译功能条默认源语言和目标语言
		config_source_target_language_bar(request);

	}

});

//配置翻译功能条默认源语言和目标语言
function config_source_target_language_bar(request){
	PLUGIN_SOURCE_LANGUAGE = request.SOURCE_LANGUAGE;//当前页面主要语言
	PLUGIN_TARGET_LANGUAGE = request.TARGET_LANGUAGE;//用户配置默认语言,插件初始化时默认为英文

	//页面语种识别,依托于谷歌浏览器的引擎识别页面语种
	if(PLUGIN_SOURCE_LANGUAGE == "und"){//如果是未识别的语言,策略：将源语言和目标语言置为相同
		PLUGIN_SOURCE_LANGUAGE == PLUGIN_TARGET_LANGUAGE;
	}


}

//改变翻译功能条显示/移除
function change_plugin_bar(flag,request){
	if(flag == 0){
		remove_plugin_box();//移除页面划词翻译功能
		remove_plugin_bar();//移除翻译插件功能条
		//转换为显示原文
		Suffer_Source(1);
		$("#moreMenu").hide();
		//发送移除消息到background,目的为改变localStorage状态
		chrome.runtime.sendMessage({plugin_status:0},function(response){});

	}else if(flag == 1){

		language_type_list_init(request);//语种列表初始化
		$("#moreMenu").hide();
		show_plugin_bar(request.IS_AUTO);//开启翻译功能条
		show_plugin_box();//开启划词翻译功能

	}
	
}

//语种列表初始化
function language_type_list_init(request){

	LANGUAGE_TYPE_LIST = request.LANGUAGE_TYPE_LIST;//复制给全局变量以供划词翻译使用

}

//翻译功能条显示
function show_plugin_bar(isAuto){

	document.body.style.paddingTop = "40px";
	document.body.style.position = "relative";

	$("#yeetool").remove();
	yeetool = document.createElement('iframe');	
	var first=document.body.firstChild;	
	document.body.insertBefore(yeetool,first);

	yeetool.id = 'yeetool';
	yeetool.style.position = "fixed";
	yeetool.style.width = '100%';
	yeetool.style.top = 0;
	yeetool.style.left = 0;
	yeetool.style.margin = 0;
	yeetool.style.zIndex = 2147483646;
	yeetool.style.height = '40px';
	yeetool.style.border = '0px';
	yeetool.scrolling='no';
	yeetool.src=chrome.extension.getURL("content.html");
	$("#yeetool").css("box-shadow","0 0 5px #888");
	//创建更多列表
	
	moreMenu_active();
	// 登陆状态
	// login_stats()
	hide_more_menu();
	// 创建书签列表
	creatmark_list();
	//插件页面动作请求监听
	bar_event_listener();

	//发送插件功能条创建初始化信息到功能条页面脚本
	send_msg_init(isAuto);
	// 翻译图片
	// translate_image_flag(img_translate_flag)
	// transimg();
}
// =======================================================================================
// 创建更多列表
function creat_more_list(loginInfos){
	$("#moreMenu").remove()
	if(loginInfos.loginStats=="true"){
		var menu="<div id='moreMenu' style='text-align:left;z-index:2147483646;background:#fff;color:#999;box-shadow: 1px 1px 10px 0 #b8b8b9;position:fixed;top:45px;right:70px;padding:10px 0'>"+
				"<p style='padding:0 20px;margin:0;cursor:pointer;font-size:12px;height:30px;line-height:30px'>"+loginInfos.userName+"</p>"+
				"<p id='faq_id'style='padding:0 20px;margin:0;cursor:pointer;font-size:12px;height:30px;line-height:30px'>FAQ</p>"+
				"<p id='content_config' style='margin:0;padding-left:20px;cursor:pointer;font-size:12px;height:30px;line-height:30px'>设置</p>"+
				"<p id='login_out' data-id="+loginInfos.id+" style='padding:0 20px;margin:0;cursor:pointer;font-size:12px;height:30px;line-height:30px'>退出</p>"+
				"</div>"
	}else{	
		var menu="<div id='moreMenu' style='text-align:left;z-index:2147483646;background:#fff;color:#999;box-shadow: 1px 1px 10px 0 #b8b8b9;position:fixed;top:45px;left:1175px;padding:10px 0'>"+
				"<p id='yeek_login' style='margin:0;padding:0 20px;cursor:pointer;font-size:12px;height:30px;line-height:30px'>登录/注册</p>"+
				"<p id='faq_id'style='margin:0;padding:0 20px;cursor:pointer;font-size:12px;height:30px;line-height:30px'>FAQ</p>"+
				"<p id='content_config' style='margin:0;padding:0 20px;cursor:pointer;font-size:12px;height:30px;line-height:30px'>设置</p>"+			
				"</div>"
	}
	// $("#moreMenu").css({"z-index":"999999","background":"#fff","color":"#999","box-shadow":"box-shadow: 1px 1px 10px 0 #b8b8b9;","position":"fixed","top":"45px","right":"5%","width":"124px","height":"87px"})
		
	$("body>:first").after(menu)
}
// 创建书签列表
function creatmark_list(){
	$("#mark_list").remove();
    var markMenu="<div id='mark_list' style='display:none;z-index:999999;background:#fff;color:#999;box-shadow: 1px 1px 10px 0 #b8b8b9;position:fixed;top:45px;right:200px;width:230px;max-height:250px;padding:2px 0'>"+
				"<a id='manger_mark' style='font-size:12px;display:block;padding-left:10px;color:#999;height:28px;line-height:28px;border-bottom:1px solid #ccc;cursor:pointer'>管理所有书签</a>"+
				"<ul id='mark_list_li' style='padding:0;,margin:0;text-align:left;max-height:220px;overflow-y:auto'></ul>"+
				"</div>"
	$("body").append(markMenu);

};
// 创建管理书签页面
function creat_mark_ifram(){
			$("#mark").remove();
			var yeelmark = document.createElement('iframe');	
			document.body.appendChild(yeelmark);
			yeelmark.id = 'mark';
			yeelmark.style.position = "fixed";
			yeelmark.style.width = '646px';
			yeelmark.style.height = '516px';
			yeelmark.style.top = "44px";
			yeelmark.style.left = 0;
			yeelmark.style.bottom = 0;
			yeelmark.style.right = 0;
			yeelmark.style.margin="auto";
			yeelmark.style.zIndex = 2147483646;			
			yeelmark.style.border = '0px';
			yeelmark.scrolling='no';
			yeelmark.style.background="#fff";
			yeelmark.style.borderRadius="10px"
			yeelmark.src=chrome.extension.getURL("mark.html");
			$("#yeelogin").css({"box-shadow": "1px 1px 10px 0 #b8b8b9"});
			mark_content();
}
// 管理书签内容
function mark_content(){
	var mark_message=document.getElementById("mark");
	chrome.runtime.sendMessage({action:"seeCollect",website:window.location.hostname,weburl:window.location.href},function(response){		
		setTimeout(function(){
			mark_message.contentWindow.postMessage({
			data:response.seeCollect.data
		},"*");
		},500)		
	})
}
// 初始化页面
(function more_list_sub(){
		
		var mark_mask="<div id='mark_mask' style='display:none;position:fixed;top:40px;left:0;z-index:99999999;height:1000px;width:100%;background:rgba(0,0,0,0.4);'></div>"
		$("body>:first").after(mark_mask)
		$(document).on("click","#manger_mark",creat_manger_mark);
		$(document).on("click","#faq_id",function(){
			chrome.runtime.sendMessage({FAQ:1},function(response){});
		});
		$(document).on("click","#content_config",function(){
			chrome.runtime.sendMessage({CONFIG:1},function(response){});
		});
		$(document).on("click","#yeek_login",function(){
				creat_login("login.html");
			// if($(this).html()=="登录/注册"){
			// }
			
		})
		$(document).on("click","#mark_close",function(){
			$(this).remove();
			$("#mark").remove();
		})
		$(document).on("mouseover","#mark_list_li li",function(){
			$(this).css({"border":"1px solid #25c47a"});
			$(this).siblings().css({"border":0})
		});
		$(document).on("mouseout","#mark_list_li li",function(){
			$(this).css({"border":"0"});	
		});
		$(document).on("click","#mark_list_li li",function(){
			var a_href=$(this).attr("data-href");
			var sour=$(this).attr("data-sour");
			var tgt=$(this).attr("data-tgt");
			chrome.runtime.sendMessage({SHOW:1,AHREF:a_href,sour:sour,tgt:tgt},function(response){});				
		})
		$(document).on("click","#marktab tbody tr",function(){		
		})
		$(document).on("mouseleave","#mark_list",function(e){
			$(this).toggle();
		});
		// 
		$(document).on("click","#login_out",function(){
			$("#moreMenu").remove();
			// loginInfos.loginStats=false;
			chrome.runtime.sendMessage({action:"LOGIN_OUT"},function(response){
				if(response.login_stats.code){
					$("#mark_list").hide()
				}
				login_stats();
				var frm = document.getElementById("yeetool");
				frm.contentWindow.postMessage({
					action:"HIDE_MARK"
				},"*")
			});
		})
})();
// 管理书签弹窗
function creat_manger_mark(){
	$("#mark_list").toggle();
	creat_mark_ifram();
	$("#mark_mask").show();
}
// 保存删除书签
function save_mark(obj){
	chrome.runtime.sendMessage({action:"SAVEMARK",data:obj,website:window.location.hostname,weburl:window.location.href},function(response){
		creat_mark_ifram();
	})
}
function remove_mark(obj){
	chrome.runtime.sendMessage({action:"REMOVEMARK",data:obj,website:window.location.hostname,weburl:window.location.href},function(response){
		creat_mark_ifram();
		var frm = document.getElementById("yeetool");
		frm.contentWindow.postMessage({
		action : "REMOVESTAR"
	}, "*");
	})
}
// 添加收藏夹
function addToCollect(){
	var title=document.title;
	var src_l=(PLUGIN_SOURCE_LANGUAGE=="zh-CN"||PLUGIN_SOURCE_LANGUAGE=="und")?"zh":PLUGIN_SOURCE_LANGUAGE;
	chrome.runtime.sendMessage({action:"add_collect",titleName:title,src:src_l,tgt:PLUGIN_TARGET_LANGUAGE,website:window.location.hostname,weburl:window.location.href},function(response){
			collect_success(response.addCollect.data.id);

	})
	show_star()
};
function collect_success(id){
	var add_success="<div id='save_change' style='box-sizing: content-box;z-index:99999999;box-shadow:1px 1px 10px 0 #b8b8b9;height:140px;width:260px;background:#fff;padding:20px;position:fixed;top:45px;left:760px'><p style='height:30px;line-height:30px;font-size:14px;color:#666;margin:0'>加入书签成功！</p><p style='font-size:12px;color:#999;margin:0;'>再次打开该网站我们将自动为您翻译此页面</p>"+
					"<div style='margin:20px 0;font-size:12px'>源语言<select id='src_lang' style='-webkit-appearance: menulist;box-sizing:border-box;color:#999;padding-left:10px;margin:0 20px 0 10px;width:64px;height:30px;text-align:center;border:1px solid #ccc;display:inline-block'>"
		for(var i in LANGUAGE_TYPE_LIST_DEFINED){
			add_success+="<option value='"+i+"'>"+LANGUAGE_TYPE_LIST_DEFINED[i]+"</option>"
		}
		add_success+="</select>目标语言<select id='tgt_lang' style='-webkit-appearance: menulist;box-sizing:border-box;color:#999;padding-left:10px;display:inline-block;margin-left:10px;width:64px;height:30px;text-align:center;border:1px solid #ccc'>"
		for(var i in LANGUAGE_TYPE_LIST_DEFINED){
			add_success+="<option value='"+i+"'>"+LANGUAGE_TYPE_LIST_DEFINED[i]+"</option>"		
		}		
		add_success+="</select></div>"+
					"<div style='height:30px;'><p style='color:#fff;background:#25c47a;float:left;text-align:center;height:30px;width:118px;line-height:30px;cursor:pointer;margin-top:0;box-sizing: border-box;font-size:12px;' id='change_lang' data-id='"+id+"'>确认</p><p style='float:left;color:#25c47a;border:1px solid #25c47a;text-align:center;height:30px;width:118px;line-height:30px;margin-left:18px;cursor:pointer;margin-top: 0;box-sizing: border-box;font-size:12px' id='nochange_lang'>取消</p></div>"+
					"</div>"
		$("body").append(add_success);
		var src_l=(PLUGIN_SOURCE_LANGUAGE=="zh-CN"||PLUGIN_SOURCE_LANGUAGE=="und")?"zh":PLUGIN_SOURCE_LANGUAGE;
		$("#src_lang").val(src_l);
		$(document).on("click","#change_lang",function(){
				var obj={
					id:$(this).attr("data-id"),
					ctSrcl:$("#src_lang").val(),
					ctTgtl:$("#tgt_lang").val()
					}
				chrome.runtime.sendMessage({action:"SAVEMARK",data:obj,website:window.location.hostname,weburl:window.location.href},function(response){
					$("#save_change").remove();
				})
		})
		$(document).on("click","#nochange_lang",function(){
			$("#save_change").remove();
		})
}
// 查看书签
function see_collection(){
	var hostImg=window.location.host;
	chrome.runtime.sendMessage({action:"seeCollect",website:window.location.hostname,weburl:window.location.href},function(response){
		var list="";var listm="";
		var  data=response.seeCollect.data||[]
		for(var i=0;i<data.length;i++){
			list+="<li data-href='"+data[i].ctUrl+"' data-sour='"+data[i].ctSrcl.split("_")[0]+"' data-tgt='"+data[i].ctTgtl.split("_")[0]+"' style='list-style:none;height:30px;line-height:30px;padding-left:10px;cursor:pointer'><img src='http://"+data[i].ctIco+"' style='float:left;height:20px;width:20px;margin:5px 6px 0 0 ' /><a href='javascript:void(0)' style='font-size:12px;float:left;text-overflow:ellipsis;overflow:hidden;width:170px;height:30px;color:#000;text-decoration:none;white-space:nowrap'>"+data[i].ctTitle+"</a></li>"
			listm+="<tr style='height:30px;' data-id="+data[i].id+" >"+
						"<td style='padding-left:10px'><img src='http://"+data[i].ctIco+"' style='height:16px;width:16px;margin-right:6px;float:left ' />"+data[i].ctTitle+"</td>"+
						"<td align='center'>"+data[i].ctSrcl+"</td>"+
						"<td align='center'>"+data[i].ctTgtl+"</td>"+
					"</tr>"
		}
		$("#mark_list_li").html(list);
		$("#marktab").find("tbody").html(listm)

	})
}
// 创建登陆页
function creat_login(url){
		$("#loginhtml").remove();
			yeelogin = document.createElement('iframe');	
			document.body.appendChild(yeelogin);
			yeelogin.id = 'loginhtml';
			yeelogin.style.position = "fixed";
			yeelogin.style.width = '424px';
			yeelogin.style.top = "44px";
			yeelogin.style.left = 0;
			yeelogin.style.bottom = 0;
			yeelogin.style.right = 0;
			yeelogin.style.margin="auto";
			yeelogin.style.zIndex = 2147483646;
			yeelogin.style.height = '590px';
			yeelogin.style.border = '0px';
			yeelogin.scrolling='no';
			yeelogin.style.borderRadius="border-radius:10px;"
			yeelogin.style.background="rbga(0,0,0,0.5)"
			yeelogin.src=chrome.extension.getURL(url);
			$("#yeelogin").css({"box-shadow": "1px 1px 10px 0 #b8b8b9"});
			$("#mark_mask").show();
}
//翻译功能条移除
function remove_plugin_bar(){
	document.body.style.paddingTop = 0;
	document.body.style.position = '';
	yeetool = $('#yeetool');
	if(yeetool != null){
		$("#yeetool").remove();
		// translate_image_flag(img_translate_flag)
		$("#mark_list").remove();
		$("#mark").remove();
		$("#mark_mask").hide();
		// $("#moreMenu").remove();
	}
}
// 图片翻译
var getEle="";
function translate_image_flag(flag){
	if(flag==1){
		img_translate_flag=0
	}else if(flag==0){
		img_translate_flag=1;
	}
	
}
function transimg(flag){
	if(img_translate_flag==1){	
		$("body").on('mousemove',function(){		
			clearInterval(getEle);	
			var ev = ev||window.event;
			// 		var x=0;
			// 		var y=0;			
			// 		if(ev.pageX || ev.pageY){
			// 			x = ev.pageX;
			// 			y = ev.pageY;
			// 		} else{
			// 			x = ev.clientX + document.body.scrollLeft - document.body.clientLeft;
			// 			y = ev.clientY + document.body.scrollTop - document.body.clientTop;
			// 		}
			
				getEle=setInterval(function(){
					if(img_translate_flag==1){
						time_ele(ev)
					}
				},1000);
		})
	}else if(flag==0){
		$("#translate_btn").remove();
	}
}
// 停留获取鼠标位置和元素
function time_ele(ev){	
	var ev=ev||window.event;	
	var ths=ev.target;
	if($(ev.target).css("backgroundImage")!="none"){
		var bgurl=$(ev.target).css("backgroundImage");
		if(bgurl!=""){
			bgurl=bgurl.split("(")[1].split(")")[0];
			bgurl=bgurl.replace("\"","")
			creat_time_ele(ev.pageX,ev.pageY-40,bgurl);
			clearInterval(getEle);
		}		
		$(document).off("mousemove");
		$(document).on("mousemove",function(e){
		var bt=document.getElementById("translate_btn");
		var evt=e||window.event;	
		if(evt.target!=ths){
			if(evt.target!=bt){
				$("#translate_btn").remove()
				$(document).off("mousemove")
			}
		}
	})
	}
	if(ev.target.nodeName=="IMG"){
		var imgurl=ev.target.src
		// creat_time_ele(ev.target.x,ev.target.y-40,imgurl);
		creat_time_ele(ev.pageX,ev.pageY-40,imgurl);
		clearInterval(getEle)
		$(document).off("mousemove");
		$(document).on("mousemove",function(e){
		var bt=document.getElementById("translate_btn");
		var evt=e||window.event;	
		if(evt.target!=ths){
			if(evt.target!=bt){
				$("#translate_btn").remove()
				$(document).off("mousemove")
			}
		}
	})
	} 
	// $(document).on("mousemove",function(e){
	// 	var bt=document.getElementById("translate_btn");
	// 	var evt=e||window.event;	
	// 	if(evt.target!=ths){
	// 		if(evt.target!=bt){
	// 			$("#translate_btn").remove()
	// 			$(document).off("mousemove")
	// 		}
	// 	}
	// })

}
function creat_install(){
	var installInfo="<div id='installInfo' style='position:relative;z-index:2147483647;color:#999;background:#fff;box-shadow:0 0 5px #888;line-height:20px;font-size:12px;width:154px;padding:12px 18px;position:fixed;top:45px;right:110px'><span id='login_register' style='color:#25c47a;cursor:pointer'>登录/注册</span>后可领取译云翻译下单券哦，更可享受自动翻译，资讯订阅等功能<span class='close_install_1' style='cursor:pointer;position:absolute;top:3px;right:5px;font-size:19px'>×</span></div>"
	var collectInfo="<div id='collectInfo' style='position:relative;z-index:2147483647;color:#999;width:176px;padding:14px 18px;background:#fff;box-shadow:0 0 5px #888;line-height:20px;font-size:12px;width:178px;padding:12px 18px;position:fixed;top:45px;right:353px'>收藏网址，下次打开即可享用自动翻译功能<span class='close_install_2' style='position:absolute;top:3px;right:5px;font-size:19px;cursor:pointer'>×</span></div>"
	$("body").append(collectInfo)
	$("body").append(installInfo)
	$("#login_register").on("click",function(){
		creat_login("login.html");		
	})
	$(document).on("click",".close_install_1",function(){
			$("#installInfo").remove()
			// $("#collectInfo").remove()
		})
	$(document).on("click",".close_install_2",function(){
			// $("#installInfo").remove()
			$("#collectInfo").remove()
		})
}

function creat_time_ele(x,y,url){
	$("#translate_btn").remove();
	var	d=document.createElement("div");
			d.id="translate_btn";
			d.style.width="80px";
			d.style.height="30px";
			d.style.background="#25c47a";
			d.style.color="#fff";
			d.style.position="absolute";
			d.style.top=y+"px";
			d.style.zIndex="889999";
			d.style.textAlign="center";
			d.style.lineHeight="30px";
			d.innerHTML="图片翻译";
			d.style.cursor="pointer";
			if( (x/1+80)>window.screen.availWidth/1 ){
				d.style.right="5px";
			}else{
				d.style.left=x+"px";
			}
			document.body.appendChild(d);
		$("#translate_btn").on("mousedown",function(e){
			if(e.which==1){
				img_translate_ajax(PLUGIN_SOURCE_LANGUAGE,PLUGIN_TARGET_LANGUAGE,url)
				if(x>$(document.body).width()*0.5&&y>$(document.body).height()*0.5){
					creat_img_translate(x-270,y-200);
				}else if(x>$(document.body).width()*0.5&&y<$(document.body).height()*0.5){
					creat_img_translate(x-270,y);
				}else if(x<$(document.body).width()*0.5&&y>$(document.body).height()*0.5){
					creat_img_translate(x,y-200);
				}else{
					creat_img_translate(x,y);
				}

			}else if(e.which==3){
				$(this).remove();
			}
		});

}
// 渲染图片翻译框
function creat_img_translate(x,y){
	var change_cont=0;
	var tgt_lan="";
	var selectText="";
		$("#translate_img_box").remove();
	var	imgtranslate_box=document.createElement("div")
			imgtranslate_box.id="translate_img_box"
			imgtranslate_box.style.width="300px";
			// imgtranslate_box.style.height="300px";
			imgtranslate_box.style.background="#fff";
			imgtranslate_box.style.color="#999";
			imgtranslate_box.style.position="absolute";
			imgtranslate_box.style.top=y+50+"px";
			imgtranslate_box.style.left=x+"px";
			imgtranslate_box.style.zIndex="889999";
			imgtranslate_box.style.border="1px solid #ccc";
			imgtranslate_box.style.borderRadius="4px";
			imgtranslate_box.style.padding="10px"
    		imgtranslate_box.style.boxSizing="content-box"
			document.body.appendChild(imgtranslate_box);
			var img_subBox="<div style='width:300px;font-size:12px;text-align:left;'>"+
					"<p style='margin:0;margin'>"+
						"<span>选择语言</span>"+
						"<select id='select_language' style='padding-left:12px;border:1px solid #ccc;height:30px;width:80px;border-radius:3px;margin-left:14px;'>"
						for(var i in LANGUAGE_TYPE_LIST_DEFINED){
							img_subBox+="<option value='"+i+"' >"+LANGUAGE_TYPE_LIST_DEFINED[i]+"</option>"
						}
			img_subBox+="</select>"+
				"<span id='close_img_window' style='ont-size:16px;position:absolute;top:12px;right:10px;font-size:20px;display: inline-block;width:20px;height:26px;text-align:center;cursor:pointer'>×</span>"+
						"<p style='color:#74d4a2;padding:10px 0px;margin:0;min-height: 20px;line-height: 20px;'>译文:</p>"+
						"<div id='imgcontent' style='color:#666666;font-size:12px;padding:10px 0px;margin:0;min-height: 20px;line-height: 20px;'>图片翻译中······"+
						"</div>"+
						"<p style='padding:10px 0px;margin:0;min-height: 20px;line-height: 20px;'>翻译内容由译库提供</p>"+
					"</p>"+
				"</div>"

			imgtranslate_box.innerHTML=img_subBox;
		$(document).on("click","#close_img_window",function(){
			$("#translate_img_box").remove();
			$("#translate_btn").remove();
		})
		// 监听语言变化
		document.getElementById("select_language").addEventListener("change", function(){
				change_cont=change_cont+1;
				// if(change_cont==1){
					
				// }else{
				// 	sou_lan=tgt_lan;

				// }
				var sou_lan=PLUGIN_TARGET_LANGUAGE;
				 tgt_lan=$("#select_language").val();
				 selectText=$("#imgcontent").attr("title")
				change_translate(sou_lan,tgt_lan,selectText);

		}, false);	

}
// 发送图片翻译请求
function img_translate_ajax(src,tgt,url){
	chrome.runtime.sendMessage({action:"IMG_TRANSLATE",src:src,tgt:tgt,url:url,website:window.location.hostname,weburl:window.location.href},function(response){
		var data=response.img_data;
		if(data.code==0){
			$("#imgcontent").html(data.data)
		}else if(data.code==1){
			var tattext="";
			for(var i=0;i<data.data.tgtlText.length;i++){
				tattext+=data.data.tgtlText[i];
			}
			var srcltext="";
			for(var i=0;i<data.data.srclText.length;i++){
				srcltext+=data.data.tgtlText[i];
			}
			$("#imgcontent").html(tattext);
			$("#imgcontent").attr("title",srcltext);
		}
	})
}
function change_translate(sour,tgt,text){
	chrome.runtime.sendMessage({action:"translate_action",sour:sour,tar:tgt,text:text},function(response){
		$("#imgcontent").html(response.text[0]);
	})
}
// =====================================================================================
//划词翻译功能开启
function show_plugin_box(){
	yeetool = document.getElementById('yeetool');
	PLUGIN_SELECT_TRANSLATION = "stop";
	yeetool.contentWindow.postMessage({
		select_translation_flag : PLUGIN_SELECT_TRANSLATION
	}, "*");
	//渲染划词翻译匡
	document.onmouseup = addYeebox;
}


//划词翻译功能关闭
function remove_plugin_box(){
	yeetool = document.getElementById('yeetool');
	PLUGIN_SELECT_TRANSLATION = "start";
	//移除划词翻译匡
	removeYeebox();
	document.onmouseup="";
	yeetool.contentWindow.postMessage({
		select_translation_flag : PLUGIN_SELECT_TRANSLATION
	}, "*");

}
var newobj;
//通道通信事件监听,监听来自插件页面脚本的action动作请求
function bar_event_listener(){
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
	eventer(messageEvent,postMessageListener, false);
}
//通道通信监听回调函数
function postMessageListener(e){
	
	if(e.data.action=="YEEKIT_SUFFER_SOURCE"){
		// 查看原文
		Suffer_Source(0);
	}else if(e.data.action=="YEEKIT_SUFFER_TARGET"){
		// 查看译文
		Suffer_Target();
	}else if(e.data.action=="YEEKIT_REMOVE_PLUGIN"){
		//移除插件
		change_plugin_bar(0);
		window.removeEventListener(((window.addEventListener ? "addEventListener" : "attachEvent")== "attachEvent" ? "onmessage" : "message"),postMessageListener);

	}else if(e.data.action=="YEEKIT_TRANSLATE"){
		
		//翻译开始前存储网页对象作为原文
		//翻译结束后存储网页对象作为译文
		
		if(e.data.sourceLang == e.data.targetLang){//源语言和目标语言相同时不执行翻译动作
			
		}else{			
			//存储原文
			save_source_element();
			//翻译开始
			total_number_of_content = get_total_number_of_translation();//统计翻译字符总量
			
			transBtnClick(e.data.sourceLang, e.data.targetLang);//开始翻译	
		}
		
		
		//发请求到background,记录点击翻译次数日志
		chrome.runtime.sendMessage({log_plugin_translate:true},function(response){});
		
	}else if(e.data.action=="YEEKIT_NEVER_REMIND"){
		PostDate();
		// console.info("stop for one week");
	}else if(e.data.action=="YEEKIT_SELECT_TRANSLATION_ON"){
		//开启划词翻译
		show_plugin_box();
		
		//发请求到background,记录点击开启划词翻译记录日志
		chrome.runtime.sendMessage({log_plugin_words_open:true},function(response){});
		
	}else if(e.data.action=="YEEKIT_SELECT_TRANSLATION_OFF"){
		//关闭划词翻译
		remove_plugin_box();
		
		//发请求到background,记录点击关闭划词翻译记录日志
		chrome.runtime.sendMessage({log_plugin_words_close:true},function(response){});
		
	}else if(e.data.action == "RELOAD_PLUGIN"){
		change_plugin_bar(0);
		change_plugin_bar(1);
	}else if(e.data.action == "YEEKIT_RESET_LANGUAGE"){
		if(e.data.isContinueTrans == 1){//继续翻译：在当前翻译完成的基础之上接着翻译
			continue_translate(e.data.sourceLang,e.data.targetLang);
		}
		PLUGIN_SOURCE_LANGUAGE = e.data.sourceLang;
		PLUGIN_TARGET_LANGUAGE = e.data.targetLang;
		
		
	}else if(e.data.action == "ABOUT"){
		window.alert("译库网页翻译：一键秒翻，轻松浏览外文网站\n版本号:1.6.0 \n最新动态：\n1） 全面提升翻译速度，让您尽享”秒翻”的精彩\n2） 优化了语言的智能识别、自动弹出功能\n3） 增强了各浏览器版本划词翻译的功能");
	}else if(e.data.action == "RGTRANS_COUNT"){
		rgTransCnt();
	}else if(e.data.action == "CHANGE_YEETOOL_HEIGHT"){
		document.getElementById("yeetool").style.height = '150px';
	}else if(e.data.action == "CHANGE_YEETOOL_RESTORE"){
		document.getElementById("yeetool").style.height = '50px';
	}else if(e.data.action == "CONFIG"){
		//发请求到background,打开插件配置页面
		
	}else if(e.data.action == "LOGO"){
		//发请求到background,打开LOGO页面
		chrome.runtime.sendMessage({LOGO:1},function(response){});
	}else if(e.data.action == "FAQ"){
		//发请求到background,打开FAQ页面
		
	}else if(e.data.action == "PERSON_TRANS"){
		//发请求到background,打开人工翻译页面
		chrome.runtime.sendMessage({PERSON_TRANS:1},function(response){});
	}else if(e.data.action == "MINIMIZE"){
		//发送请求到
		// chrome.runtime.sendMessage({TESTTX:1},function(response){});
		miniplug();
	}else if(e.data.action == "MORE_IN"){
		// $("#moreMenu").toggle();
		if(e.data.moreflag=="false"){
			creat_more_list(loginInfos)
		}else{
			$("#moreMenu").toggle();
		}
	}else if(e.data.action =="MORE_OUT"){
		// loginInfos.loginStats=false;
	}else if(e.data.action =="PLUGLOGO"){
		maxplug();
	}else if(e.data.action == "MARKLIST"){
		$("#mark_list").toggle()
		see_collection();
	}else if(e.data.action == "COLLECT"){
		addToCollect();
	}else if(e.data.action == "CLOSE_REG"){
		close_login_ifram()
	}else if(e.data.action=="REGBTN"){
		toRegister(e.data.reg)
	}else if(e.data.action == "GETCODE"){
		getcode(e.data.codeinfo)
	}else if(e.data.action == "LOGIN"){
		toLogin(e.data.logininfo)
	}else if(e.data.action == "CREAT_LOGIN"){
		creat_login("login.html");
	}else if(e.data.action == "BACK_PWD"){
		back_password(e.data.backinfo)
	}else if(e.data.action == "BACK_CODE"){
		back_code(e.data.back_code);
	}else if(e.data.action == "CLOSE_MARK"){
		$('#mark').remove();
		$("#mark_mask").hide();
	}else if(e.data.action == "SAVE_MARK"){
		save_mark(e.data.markId)
	}else if(e.data.action =="REMOVE_MARK"){
		remove_mark(e.data.markId)
	}else if(e.data.action=="SAVEPWD"){
		save_pwd(e.data.data)
	}else if(e.data.action=="STAR"){
		loginInfos.loginStats=e.data.loginStat
		show_star()
		// login_stats();
	}else if(e.data.action=="STAR_No"){
		// login_stats();
	}else if(e.data.action=="REMOVE_loginNo"){
		chrome.runtime.sendMessage({action:"REMOVEMARK",data:{id:e.data.markId},website:window.location.hostname,weburl:window.location.href},function(response){
		})
		$("#save_change").remove()
	}
}
// 控制收藏按钮样式
	function show_star(){
		chrome.runtime.sendMessage({action:"seeCollect",ctUrl:window.location.href},function(response){
			var frm = document.getElementById("yeetool");
			// var urlid=response.seeCollect.data.length>0?response.seeCollect.data:[{id:""}]
			if(response.seeCollect.code==1){
				frm.contentWindow.postMessage({
					action:"HAS_NO",
					urlid:response.seeCollect.data[0].id
				}, "*");
			}
			
			
		})
	}
// 保存修改密码
function save_pwd(obj){
	chrome.runtime.sendMessage({action:"SAVE_PWD",data:obj},function(response){
		if(response.save_pwd.code==1){
			$("#loginhtml").attr("src",chrome.extension.getURL("login.html"))
		}else{
			loginhtml.contentWindow.postMessage({
					action:"save_err",
					errInfo:response.save_pwd.msg
				},"*")
		}
	})
}

// 找回密码
function back_password(obj){
	chrome.runtime.sendMessage({action:"back_password",data:obj},function(response){
		if(response.back_pwd.code=="1"){
			$("#loginhtml").attr("src",chrome.extension.getURL("forget.html"))
				setTimeout(function(){
					loginhtml.contentWindow.postMessage({
					action:"complete_UID",
					data:response.back_pwd.data
				},"*")
				},1000)
				
		}else{
			loginhtml.contentWindow.postMessage({
					action:"err_code"
				},"*")
		}
	})
}
// 验证码
function back_code(obj){
	chrome.runtime.sendMessage({action:"BACKCODE_ACTION",data:obj,src:PLUGIN_SOURCE_LANGUAGE,tgt:PLUGIN_TARGET_LANGUAGE,website:window.location.hostname,weburl:window.location.href},function(response){		
		if(response.checkInfo=="phoneIsExit"){
			chrome.runtime.sendMessage({action:"SEND_PCODE",obj:obj},function(response){
				loginhtml.contentWindow.postMessage({
					action:"forget_UID",
					data:response.codeInfo.data.uid
				},"*")
			});
			
		}else if(response.checkInfo=="emailIsExit"){
			chrome.runtime.sendMessage({action:"SEND_CODE",obj:obj},function(response){
				loginhtml.contentWindow.postMessage({
					action:"forget_UID",
					data:response.codeInfo.data.uid
				},"*")
			});
		}else if(response.checkInfo=="emailNo"){
			loginhtml.contentWindow.postMessage({
					action:"forget_emailNo"
				},"*")
		}else{
			loginhtml.contentWindow.postMessage({
					action:"forget_phoneNo"
				},"*")
		}	
		
	})
}
// 登陆
function toLogin(obj){
	chrome.runtime.sendMessage({action:"LOGIN_ACTION",data:obj,src:PLUGIN_SOURCE_LANGUAGE,tgt:PLUGIN_TARGET_LANGUAGE,website:window.location.hostname,weburl:window.location.href},function(response){
		if(response.login.code==1){
			
			var frm = document.getElementById("yeetool");
			$("#loginhtml").remove();
			$("#mark_mask").hide();
			$("#mark_list_li").empty();
			// remove_plugin_bar();
			// show_plugin_bar(true);
			chrome.runtime.sendMessage({action:"AUTO_PUSH",data:obj},function(response){})
			frm.contentWindow.postMessage({
					action:"SHOW_MARK"
				}, "*");
			login_stats();
		}else{
			loginhtml.contentWindow.postMessage({
					action:"LOGIN_ERR",
					msg:response.login.msg
				},"*")
		}
	})
}
// 登陆状态判断
function login_stats(){
	chrome.runtime.sendMessage({action:"LOGIN_STATS"},function(response){
		// creat_more_list(response.login_stats);
		// loginInfo.userName=response.login_stats.userName||"";
		if(response.login_stats.code=="1"){
			loginInfos.loginStats="true";
			loginInfos.userName=response.login_stats.data.userName;
			console.log(loginInfos.userName)
			loginInfos.id=response.login_stats.data.id;	
			var url=window.location.href	 
				chrome.runtime.sendMessage({action:"seeCollect"},function(response){
					for(var i=0;i<response.seeCollect.data.length;i++){
						if(url==response.seeCollect.data[i].ctUrl){
							// 最小化插件
							change_plugin_bar(1,response);
							PLUGIN_SOURCE_LANGUAGE=response.seeCollect.data[i].ctSrcl.split("_")[0]
							PLUGIN_TARGET_LANGUAGE=response.seeCollect.data[i].ctTgtl.split("_")[0]
							if(PLUGIN_SOURCE_LANGUAGE!=PLUGIN_TARGET_LANGUAGE){
								setTimeout(function(){
								var frm = document.getElementById("yeetool");
										frm.contentWindow.postMessage({
											action:"autoTranslate"
										},"*");
										frm.contentWindow.postMessage({
										action:"SHOW_MARK"
									}, "*");
							},1000)
							}
							return ;
						}
					}
				});
		}else{
			loginInfos.loginStats="false";
		}
	})
}

// 关闭注册iframe窗口
function close_login_ifram(){
	$("#mark_mask").hide();
	$("#loginhtml").remove();
}
// 发送验证码
function getcode(obj){
		var loginhtml=document.getElementById("loginhtml")
	chrome.runtime.sendMessage({action:"GET_CODE",obj:obj},function(response){
		if(response.checkInfo=="emailNo"){
			chrome.runtime.sendMessage({action:"SEND_CODE",obj:obj},function(response){
				if(response.codeInfo.code=="1"){
					loginhtml.contentWindow.postMessage({
					action:"UID",
					uid:response.codeInfo.data.uid
				},"*")
				}else{
					loginthml.contentWindow.postMessage({
						action:"sendInfo",
						data:response.codeInfo
					},"*")
				}
				
			})
		}else if(response.checkInfo=="phoneNo"){
			chrome.runtime.sendMessage({action:"SEND_PCODE",obj:obj},function(response){
				if(response.codeInfo.code=="1"){					
					loginhtml.contentWindow.postMessage({
						action:"UID",
						uid:response.codeInfo.data.uid
					},"*")
				}else{
					loginhtml.contentWindow.postMessage({
						action:"sendInfo",
						data:response.codeInfo
					},"*")
				}
			})
		}else if(response.checkInfo=="phoneIsExit"){
			loginhtml.contentWindow.postMessage({
					action:"regerr"
				},"*")
		}else if(response.checkInfo=="emailIsExit"){
			loginhtml.contentWindow.postMessage({
					action:"regerr"
				},"*")
		}
	})
}
// 注册
function toRegister(obj){
	var loginhtml=document.getElementById("loginhtml");
	chrome.runtime.sendMessage({action:"REGINFO",obj:obj},function(response){
		if(response!=""){
			if(response.reginfo.code==1){
				$("#loginhtml").attr("src",chrome.extension.getURL("registerSuccess.html"));
				setTimeout(function(){
					loginhtml.contentWindow.postMessage({
						action:"SUCCESS",
						yeecloudCode:response.reginfo.data.yeecloudCode
					},"*")					
				},1000)
			}else{
				loginhtml.contentWindow.postMessage({
					action:"REG_ERR",
					err:response.reginfo.msg
				},"*")
			}
		}
		
	})
	
}
// 最小化插件
function miniplug(){
	$("#yeetool").css({"width":"40px","height":"40px","top":"70%","left":"96%","border-radius":"50%"});
	$("body").css("padding-top","0");	
	$("#moreMenu").hide();
	
}
function maxplug(){
	$("#yeetool").css({"width":"100%","height":"40px","top":"0","left":"0","border-radius":"0","border":"0"});
	$("body").css("padding-top","40px");
}
function hide_more_menu(){
	$(document).on("mouseover","#moreMenu",function(){
		$(this).show(0,function(){
			var frm = document.getElementById("yeetool");
			frm.contentWindow.postMessage({
			action : "more_show"
		}, "*");
		})

	});
	$(document).on("mouseout","#moreMenu",function(){
		$(this).hide(0,function(){
			var frm = document.getElementById("yeetool");
			frm.contentWindow.postMessage({
			action : "more_hide"
		}, "*");
		})
		$("#moreMenu p").css({"background":"#fff","color":"#999"});
		
		
	});
}
function moreMenu_active(){
	$(document).on("mouseover","#moreMenu p",function(){
		$("#moreMenu p").css({"background":"#fff","color":"#999"});
		$(this).css({"background":"#25c47a","color":"#fff"});

	})
};


// -----------------------------------------------
function showplug(){
	$("#yeetool").css({"display":"block"});
	$("body").css("padding-top","40px");
}
/**
 * 存储原文DOM对象
 */
function save_source_element(){
	var children = $("body").children().not($("#yeetool"));

	//给body下面的每个子DOM对象添加id
	$.each(children,function(index,ele){
		//添加id
		if(!($("body").children().not($("#yeetool")).eq(index).attr("id"))){
			$("body").children().not($("#yeetool")).eq(index).attr("id","yeeId_"+index);
		}
		//存储原文DOM对象
		sourceNewObj[$("body").children().not($("#yeetool")).eq(index).attr("id")] = $("body").children().not($("#yeetool")).eq(index).clone();
	});
	
}

/**
 * 存储译文DOM对象
 */
function save_target_element(){
	var children = $("body").children().not($("#yeetool"));

	//给body下面的每个子DOM对象添加id
	$.each(children,function(index,ele){
		//存储译文DOM对象
		targetNewObj[$("body").children().not($("#yeetool")).eq(index).attr("id")] = $("body").children().not($("#yeetool")).eq(index).clone();
	});
	
}

/**
 * 查看原文
 */
function Suffer_Source(flag){

	if(total_number_of_content>0){
		
		//通过缓存对象还原原文网页
		var domsize = $("body").children().not($("#yeetool")).length;
		for(var i = 0;i < domsize+1;i++){
			$("body").children().not($("#yeetool")).eq(i).replaceWith($(sourceNewObj[$("body").children().not($("#yeetool")).eq(i).attr("id")]).clone());
		}
		
		
		//转换按钮状态为“查看译文”
		var frm = document.getElementById("yeetool");
		frm.contentWindow.postMessage({
			action : "YEEKIT_LOAD_TARGET_BUTTON",
			flag:flag//flag 0的常规翻译显示译文 1继续翻译显示译文
		}, "*");		

	}

}

/**
 * 查看译文
 */
function Suffer_Target(){
	// save_source_element();

	//通过缓存对象还原译文网页
	var domsize = $("body").children().not($("#yeetool")).length;
	for(var i = 0;i < domsize+1;i++){
		$("body").children().not($("#yeetool")).eq(i).replaceWith($(targetNewObj[$("body").children().not($("#yeetool")).eq(i).attr("id")]).clone());
	}


	//转换按钮状态为“查看原文”
	var frm = document.getElementById("yeetool");
	frm.contentWindow.postMessage({
		action : "YEEKIT_LOAD_SOURCE_BUTTON"
	}, "*");
	
}



/**
 * 在当前已翻译的基础上接着翻译
 * source:源语言 target:需要翻译成的目标语言
 */
function continue_translate(source,target){

	//程序业务工作流程：

	//1.恢复功能条样式
	yeetool = document.getElementById("yeetool");
	yeetool.contentWindow.postMessage({
		action : "CONTINUE_TRANS"
	}, "*");
	//2.先转换为显示原文
	Suffer_Source(1);
}



//发送插件功能条创建初始化信息到功能条页面脚本
function send_msg_init(isAuto){
	yeetool.onload = function(){
		yeetool.contentWindow.postMessage({
			action : "YEEKIT_SHOW_PLUGIN",
			//是否为自动识别弹出
			is_auto:isAuto
		}, "*");
		yeetool.contentWindow.postMessage({
			action : "YEEKIT_SET_LANGUAGE",
			sourceLang : PLUGIN_SOURCE_LANGUAGE,
			targetLang : PLUGIN_TARGET_LANGUAGE,
			//语种列表初始化
			languageTypeList : ($.isEmptyObject(LANGUAGE_TYPE_LIST))?LANGUAGE_TYPE_LIST_DEFINED:LANGUAGE_TYPE_LIST
		}, "*");
		//点击时，源语言和目标语言一致也显示划词
		//if(PLUGIN_SOURCE_LANGUAGE!=PLUGIN_TARGET_LANGUAGE && PLUGIN_TARGET_LANGUAGE != "und")
		yeetool.contentWindow.postMessage({
			select_translation_flag : PLUGIN_SELECT_TRANSLATION

		}, "*");
	};
}

/**
 * 翻译字符长度计算
 */
function get_total_number_of_translation(){
	total_number_of_content = 0;
	walkTheDOM(document.body, function(node) {
	if (node.nodeType=== 3) { // Is it a Text node?
		var text = node.data.trim();
		var parent = node.parentNode;
		if (parent.nodeName != "SCRIPT" && parent.nodeName != "NOSCRIPT" && parent.nodeName != "STYLE" && parent.nodeName != 'TEXTAREA' && parent.nodeName != 'PRE' && parent.nodeName != 'CODE' && parent.id != 'yeebox') {
				if (text.length > 0 && text.length < 5120) {
					total_number_of_content += 1;
				}
			}
		}
	});
	// console.info(total_number_of_content);
	return total_number_of_content;
}

/**
 * DOM遍历
 */
function walkTheDOM(node, func) {
	func(node);
	node = node.firstChild;
	while (node) {
		walkTheDOM(node, func);
		node = node.nextSibling;
	}
}

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
 * 网页翻译 - 开始翻译
 */
function transBtnClick(sourcelang, targetlang) {
	//源语言,目标语言参数
	sourcelang_ = sourcelang;
	targetlang_ = targetlang;

	//翻译长度	
	//total_number_of_content
	
	percentage = 0;
	request_iter = 0;
	list_iter = 0;
	list_total = 0;
	translation_list = [];
	translation_node = [];
	all_content=[];
	if (sourcelang == targetlang && sourcelang != "und") {//如果目标语言和源语言相同,直接翻译结束,进度条干满
		progressBar(1.0);
	} else {
		var translateId = create_uuid();
		walkTheDOM(document.body, function(node) {

			if (node.nodeType === 3) { // Is it a Text node?

				var text = node.data.trim();
				var parent = node.parentNode;
				if (parent.nodeName != "SCRIPT"
						&& parent.nodeName != "NOSCRIPT"
						&& parent.nodeName != "STYLE"
						&& parent.nodeName != 'TEXTAREA'
						&& parent.nodeName != 'PRE'
						&& parent.nodeName != 'CODE'
						&& parent.id !='yeebox') {
					if (text.length > 0 && text.length < 5120) {
						try {
							JSON.parse(text);
							request_iter += 1;
							list_total += 1;
						} catch (err) {
							try {

								term_translation = dict[text];
								if (term_translation) {
									node.data = term_translation;
									sourceMap[term_translation]=text;//存储  “key:译文-->value:原文” 键值对
									transMap[text]=term_translation;//存储 “key:原文-->value:译文” 键值对
									request_iter += 1;
								} else {

									translation_list[list_iter] = text;
									translation_node[list_iter] = node;
									list_iter += 1;
									list_total += 1;
									if (list_iter == 20 || list_total == total_number_of_content){
										//翻译
					
										list_translation(sourcelang_,targetlang_,translation_list,translation_node,translateId);
										list_iter = 0;
										translation_list = [];
										translation_node = [];
									}
									//translate(sourcelang_,targetlang_,text,node);
								}
							} catch (err) {
								request_iter += 1;
							}
						}
					}
				}
			}

		});

		Additional_Translate(sourcelang_,targetlang_);
		// console.info('total translation request time in the DOM: ' + request_iter);
		
	}
}
var yeektext_str=""
function addText(text){
	yeektext_str+=text
}
/**
 * 网页翻译 - 进度更新 - 通知到弹出框功能条
 */
function progressBar(index) {
	var frm = document.getElementById("yeetool");
	frm.contentWindow.postMessage({
		action : "YEEKIT_CHANGE_PROGRESSBAR",
		index : (index*100).toFixed(0)
	}, "*");
}

/**
 * 进度条加载 - 加载百分比计算
 */
 var fasongyisi=0;
function changeProgress(){
	progress = request_iter / total_number_of_content;
	currentpercentage = progress * 100;
	//console.log('current step:' + request_iter + '\t amount:' + total_number_of_content + '\t progress:' + progress);
	if (currentpercentage - percentage >= 1) {
		progressBar(percentage / 100);
		percentage = currentpercentage - currentpercentage % 1;
	}

	if(progress >= 0.95){
		progress = 1.0;
		progressBar(progress);
		//查看原文前保存译文
		save_target_element();
		// 发送“查看原文”消息
		var frm = document.getElementById("yeetool");
		frm.contentWindow.postMessage({
			action : "YEEKIT_LOAD_SOURCE_BUTTON"
		}, "*");
		fasongyisi++;
		if(fasongyisi<=1){
			// 发送页面内容到后台
			chrome.runtime.sendMessage({action:"SEND_TEXT_STR",data:yeektext_str,language:PLUGIN_SOURCE_LANGUAGE},function(){

			})

		}
	
	}
}

/**
 * 网页翻译 - 渲染翻译元素
 */
function Additional_Translate(srcl,tgtl){
	
	var whatToObserve = {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']};
	var mutationObserver = new MutationObserver(function(mutationRecords) {
		for(var p = 0; p < mutationRecords.length; p++){
			var mutationRecord = mutationRecords[p];
			if (mutationRecord.type === 'childList') {
				if (mutationRecord.addedNodes.length > 0) {
					additional_request_iter = 0;
					for(var i = 0 ; i < mutationRecord.addedNodes.length; i++){
						walkTheDOM(mutationRecord.addedNodes[i], function(node) {
							if (node.nodeType === 3) { 
								var text = node.data.trim();
								var parentnode = node.parentNode;
								try {
									JSON.parse(text);
								} catch (err) {
									if (text.length > 0 && text.length < 5120) {
										if (parentnode.nodeName != "SCRIPT"
												&& parentnode.nodeName != "NOSCRIPT"
												&& parentnode.nodeName != "STYLE"
												&& parentnode.nodeName != 'TEXTAREA'
												&& parentnode.nodeName != 'PRE'
												&& parentnode.nodeName != 'CODE'
												&& parentnode.id!='yeebox') {
											try {
												term_translation = dict[text];
												if (term_translation) {
													node.data = term_translation;
//													sourceMap[term_translation]=text;//存储  “key:译文-->value:原文” 键值对
//													transMap[text]=term_translation;//存储 “key:原文-->value:译文” 键值对
													request_iter += 1;
													list_total += 1;
												} else {
													translation_list[list_iter] = text;
													translation_node[list_iter] = node;
													list_iter += 1;
													list_total += 1;
													if (list_iter == 20 || list_total == total_number_of_content){
														list_translation(sourcelang_,targetlang_,translation_list,translation_node);
														list_iter = 0;
														translation_list = [];
														translation_node = [];
													}
												}
											} catch (err) {
												console.log("dom change translate error:"+err.message);
											}
										}
									}
								}
							}
						});
					}
				}
			}
		}
	});
	mutationObserver.observe(document.body, whatToObserve);
}

/**
 * 异步批量翻译
 */
function list_translation(src,tgt,texts,nodes,translateId){
	var add_text="";
	if(translateId != undefined){
		//为解决复杂网页跨域失败问题,将请求权交给background
		chrome.runtime.sendMessage({action:"list_translate_action",src:src,tgt:tgt,texts:texts,translateId:translateId,website:window.location.hostname,weburl:window.location.href},function(response){
			// console.log(response);
			var translation_result = response.data.data;
			if(nodes[0].data != translation_result[0]){
				for(var i = 0 ; i < translation_result.length ; i++){
					var translation = translation_result[i];
					text = texts[i];
					add_text+=text //
					// var re=new RegExp("[\\u4E00-\\u9FFF]+","g");
					// console.log(translation);
					// if(tgt=="zh" && re.test(translation)){
					// 	translation = translation_result[i].replace(/\s+/g, "");
					// }
					// if(tgt=="zh"){
					// 	translation = translation_result[i].replace(/\s+/g, "");
					// }

					sourceMap[encodeURI(text)] = encodeURI(translation);
					targetMap[encodeURI(translation)] = encodeURI(text);


					if(undefined !== nodes[i].data){
						nodes[i].data = translation;
					}else{
						nodes[i] = translation;
					}
					
					request_iter += 1;
					changeProgress();
				}
				addText(add_text);
			}else{
				for(var i = 0 ; i < translation_result.length ; i++){					
					request_iter += 1;
					changeProgress();
				}
			}
		});
	}
	
	
}




//渲染划词翻译显示框
function addYeebox(ev){
	var selectText = getSelectionText();
	if(selectText.replace(/(^\s*)|(\s*$)/g, "").length>0 && !($('#yeebox').length > 0)){
		//源语言与目标语言不一致时才弹出翻译框(前面已经用标志限制了按钮，所以此处不用再限制)
			var yeebox = document.getElementById('yeebox');
			if(yeebox!=null){
				yeebox.parentNode.removeChild(yeebox);
			}
			var divElement = document.createElement('div');
			divElement.charset = 'utf-8';
			
			var ev = ev||window.event;
			var x=0;
			var y=0;			
			if(ev.pageX || ev.pageY){
				x = ev.pageX;
				y = ev.pageY;
			} else{
				x = ev.clientX + document.body.scrollLeft - document.body.clientLeft;
				y = ev.clientY + document.body.scrollTop - document.body.clientTop;
			}

			//弹出框坐标自动调整策略
			/*var autoX = 380;
			var autoY = 250;
			if(document.body.clientHeight - y < autoY){//网页可见区域高度 - 当前鼠标所在高度  < 划词框的高度     ,则加y值一个划词框的高度
				y = y - autoY;
			}
			if(document.body.clientWidth - x < autoX){//网页可见区域宽度 - 当前鼠标所在宽度  < 划词框的宽度     ,则加x值一个划词框的宽度
				x = x - autoX;
			}*/
			
			//弹出框坐标自动调整策略
			var autoX = 380;
			var autoY = 250;
			var heigao = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			var widkuan = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			if(heigao - y < autoY){//网页可见区域高度 - 当前鼠标所在高度  < 划词框的高度     ,则加y值一个划词框的高度
				y = y - autoY;
			}
			if(widkuan - x < autoX){//网页可见区域宽度 - 当前鼠标所在宽度  < 划词框的宽度     ,则加x值一个划词框的宽度
				x = x - autoX;
			}
			
			left=ev.clientX,top=ev.clientY;
			document.body.appendChild(divElement);
			divElement.id = 'yeebox';
			divElement.name = 'yeebox';
			divElement.style.position = "absolute";
			divElement.style.left = x + 'px';
			divElement.style.top = y + 'px';
			divElement.style.height = '210px';
			divElement.style.width = '350px';
			divElement.style.zIndex = 2147483647;
			divElement.style.border = 'solid 1px #0093D5';
			divElement.style.background='#FFFFFF';
			divElement.style.fontSize='12px';
			divElement.style.borderRadius='5px';
			divElement.style.boxShadow='0px 0px 5px #0093D5';
			var boxhtml = '<div style="text-align: left;margin-top:5px;padding-left:5px;">选择语言：<select id="targetLanguage" style="height:20px;padding:0px 0px;">';
			//循环语种列表对象,得到语种对象
			if($.isEmptyObject(LANGUAGE_TYPE_LIST)){
				LANGUAGE_TYPE_LIST = LANGUAGE_TYPE_LIST_DEFINED;	
			}
			$.each(LANGUAGE_TYPE_LIST,function(langCode,langName){
				boxhtml += '<option value="'+langCode+'" >'+langName+'</option>';
			});
			
			boxhtml += '</select></div><div id="transRes" style="text-align: left;margin:0 auto;margin-top:10px;padding-left:5px;padding-top:5px;font-size:14px;width:93%;height:147px;overflow:auto;border:1px solid lightgrey;border-radius:5px;cursor:text;"><div style="color:gray;margin-top:60px;text-align:center;font-size:12px;">翻译中 . . . </div></div>'+
			'<div style="text-align: left;color:#999999;margin-top:0px;margin-left:10px;font-size:12px;width:340;position:relative;font-family:微软雅黑;">翻译内容由译库提供'+
			'<a href="http://www.yeekit.com" target="blank_" text-align="right" style="color:#000099;position:absolute;right:10px;">发现更多精彩</a></div>';
			
			divElement.innerHTML= boxhtml;
			
			divElement.onmousemove = function(){
				document.onclick="";
				document.onmouseup="";
			};
			divElement.onmouseout = function(){
				document.onmouseup = addYeebox;
			};
			
			document.getElementById("targetLanguage").value = PLUGIN_TARGET_LANGUAGE;
			document.getElementById("targetLanguage").style.disabled = "disabled";//禁用
			
			transSelectText(PLUGIN_SOURCE_LANGUAGE,PLUGIN_TARGET_LANGUAGE,selectText);
			
			//监听选择其他语言
			document.getElementById("targetLanguage").addEventListener("change", function(){
					changeLanguage(PLUGIN_SOURCE_LANGUAGE,selectText);
			}, false);
		//}
	}else{
		//监听到鼠标在yeebox里时，不关闭box
		var is_close = true;
		var yeebox = document.getElementById('yeebox');
		if(yeebox!=null){
			yeebox.addEventListener("mousemove", function(){
				is_close = false;
			}, false);
		}
		//不在yeebox里，点击其他地方时，关闭box
		if(is_close){
			removeYeebox();
		}
	}
}

//移除划词翻译框
function removeYeebox(){
	var createYeeboxJs2 = $('#createYeeboxJs');
	if (createYeeboxJs2 != null) {
		$('#createYeeboxJs').remove();
	}

	var yeebox = $('#yeebox');
	if (yeebox != null) {
		$('#yeebox').remove();
	}
}

//划词翻译工具方法 - 获取选中文本
function getSelectionText() {
	if (window.getSelection) {
		return window.getSelection().toString();
	} else if (document.selection && document.selection.createRange) { //if is IE
		return copytext_keleyi_com = document.selection.createRange().text;
	}
	return '';
}

//翻译选中划词文本
function transSelectText(sour,tar,text){
	//语种识别
	//为解决复杂网页跨域失败问题,将请求权交给background
	chrome.runtime.sendMessage({action:"lang_type_action",lang_text:text,website:window.location.hostname,weburl:window.location.href},
		function(response){
			//console.log(response);
			//单个单词直接读取设置，不进行语种检测
			if(text.indexOf(" ") != -1){
				sour =  response.lang_type;
			}
			go_translate(sour,tar,text);
		}
	);


}

//调用background接口进行翻译(监听在translate.js)
function go_translate(sour,tar,text){
	if(tar == "" || tar == null){
		tar = document.getElementById("targetLanguage").value;
	}
	
	tar = tar.toLowerCase();
	sour = sour.toLowerCase();
	if(sour == "zh-cn"){
		sour = "zh";
	}
	if(tar == "zh-cn"){		
		tar = "zh";
	}
//	console.log(sour+"~~~~~~~~"+tar);
	var translateId = create_uuid();
	//为解决复杂网页跨域失败问题,将请求权交给background
	chrome.runtime.sendMessage({action:"translate_action",sour:sour,tar:tar,text:text,translateId:translateId,website:window.location.hostname,weburl:window.location.href},
		function(response){
			var text = response.text;
			//如果语言为中文,去空格
			if(tar == "zh"){
				text = (text+"").replace(/\s+/g, "");
			}
			if(sour==tar){
				document.getElementById('transRes').innerHTML = text;
			}else{
				var json = "";
				try{
					json = text;
			    }catch(e){
					document.getElementById('yeebox').innerHTML='<div style="font-size:14px; text-align:center; padding-top:25%; font-family: \'microsoft yahei\';">远程接口调用失败，翻译失败!</div>';
				}
				var resTranslation = text;

				if(document.getElementById('transRes')!="undefined"){
					if(resTranslation){
						document.getElementById('transRes').innerHTML = resTranslation;
					}else{
						document.getElementById('transRes').innerHTML = '<div style="font-size:12px; text-align:center; padding-top:60px; font-family: \'microsoft yahei\'; color:#800080;">暂不支持对该语言的翻译!</div>';
					}
				}
			}

		}
	);

}



//选择其他语言
function changeLanguage(sour,text){
	var newTarget = document.getElementById("targetLanguage").value;
//	if(sour==newTarget){
//		document.getElementById('transRes').innerHTML = text;
//	}else{
		transSelectText(sour,newTarget,text);
//	}
}