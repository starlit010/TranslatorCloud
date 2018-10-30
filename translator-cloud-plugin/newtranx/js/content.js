//监听chrome的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.info('===========================');
    console.info(request);
	var arrFun = {
		//==========后台
		"show_newtranx_plugin": function() {
			Content_Common_Function._show_newtranx_plugin(request);
		},
		"auto_newtranx_plugin": function() {
            Content_Common_Function._auto_newtranx_plugin(request);
		},
		
		"asyn_get_picture_info": function () {
            Content_Common_Function.initPicture(request.screenshotUrl);
        },
		//===========子页面
        // 查看原文
        "NEWTRANX_SUFFER_SOURCE": function() {
            Content_Common_Function.Suffer_Source();
        },
        // 查看译文
        "NEWTRANX_SUFFER_TARGET": function() {
            Content_Common_Function.Suffer_Target()
        },
        //修改配置
        "NEWTRANX_MODIFY_SETTINGSINFO": function () {
            Chrome_Content_Common_Commond._setSettingInfo(request.SETTING_INFO);
        },
        //重置语言
        "NEWTRANX_RESET_LANGUAGE": function () {
            NewTranx_Source_language = request.sourceLang
            NewTranx_Target_language = request.targetLang
            NewTranx_Subject = request.subject
        },
        //网页翻译
        "NEWTRANX_TRANSLATE": function() {
            service.get_message_statistics().then(function (data) {
                //@TODO 统计消息的提示
                if(!data.message) return
                console.info('get_message_statistics result:' + JSON.stringify(data));
                // data = {
                //     title: '恭喜你中奖了(系统消息)',
                //     image: 'images/cj_28.jpg',
                //     content: '社会主义嘎嘎好，撸起袖子使劲干！社会主义嘎嘎好，撸起袖子使劲干！',
                //     url: 'http://www.baidu.com'
                // }
                Content_Common_Function.tipsMessage(data.message)
            })
            total_number_of_content = Content_Common_Function.get_total_number_of_translation();
            Content_Common_Function.transBtnClick(request)
        },
        //文本翻译
        "NEWTRANX_TRANSLATE_TEXT": function () {
            Content_Common_Function.trans_mt_text(request)
        },
        //移除插件
        "NEWTRANX_REMOVE_PLUGIN": function() {
            Content_Common_Function.remove_newtranx_plugin();
        },
        //横屏竖屏切换
        "NEWTRANX_SCREEN_VH": function() {
            Chrome_Content_Common_Commond._setSettingInfo(request.SETTING_INFO);
            window.location.reload();
        },
        //所有弹出页面（因为有些页面可能会被拦截）
        "NEWTRANX_WINDOW_OPEN": function() {
            Content_Common_Commond._NEWTRANX_TIPS('弹出窗口可能被拦截，需要您允许')
            if(!!au[request.url]) {
                window.open(au[request.url], "newtranx plugin");
            } else {
                window.open(request.url, "newtranx plugin");
            }
        },
        //表单 所有弹出页面（因为有些页面可能会被拦截）
        "NEWTRANX_FORM_OPEN": function() {
            Content_Common_Commond._NEWTRANX_TIPS('弹出窗口可能被拦截，需要您允许')
            if(!!au[request.url]) {
                Content_Common_Function.open_url_form(request.url);
            }
        },
        //isTranslate
        "WINDOW_NEWTRANX_IS_TRANSLATE": function() {
            isTranslate = request.isTranslate
        },
        //Open Full Screen
        "WINDOW_NEWTRANX_FULL_SCREEN": function() {
            Content_Common_Function._windowFullScreen_control(request)
        },
        //获取快照
        "GET_PICTURE": function () {
            Chrome_Content_Common_Commond._getPicture()
        },
        //接收测试消息
        "msg": function() {
            console.info('bind_.js msg:' + request.msg);
        },
        //获取用户信息
        "NEWTRANX_POLLING_LOGIN": function() {
            Content_Common_Function.userInfo();
        },
        //账号密码登录，获取token
        "NEWTRANX_USER_LOGIN": function() {
            Content_Common_Function.userLogin(request);
        },
        //用户退出
        "NEWTRANX_USER_LOGOUT": function() {
            Content_Common_Function.userLogout();
        },

        //重新加载
        "RELOAD_PLUGIN": function() {
            Content_Common_Function.remove_newtranx_plugin();
            Content_Common_Function.show_newtranx_plugin();
        },
        //查询登录信息
        "CENTER_NEWTRANX_PLUGIN": function() {
			var url = chrome.extension.getURL("order/page/center.html");
		},
	}
	if(!!request.SETTING_INFO) SETTING_INFO = request.SETTING_INFO;
	if(!!request.action) arrFun[request.action]();
});

//100002 登录失败

//100000 ： 版本过低
//100001 ： 请求成功
//100002 ： 请求失败
//100003 ： 请求达到最大次数
//100004 ： 缺少参数
//100005 ：没有当前用户
//100006 ：还没有购买产品
//100007 ：该用户可以访问翻译接口
//100008 ：该用户已到期请续期！
//100009 ：生成二维码失败
//100010 ：支付金额不正确，支付未成功
//100011 ：用户未登录