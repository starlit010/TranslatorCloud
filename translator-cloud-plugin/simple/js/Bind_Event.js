function load_button() {

	//1.所有按钮事件的绑定
    Bind_Common_BindButton();

	//获得监听，开始接受content发送的消息。判断是区分ie（attachEvent）和Mozilla（addEventListener）
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = "attachEvent" == eventMethod ? "onmessage" : "message";
	//监听事件绑定
	eventer(messageEvent, function(t) {
	    var params = t.data;
		var arrFun = {
            //插件手动弹出
            "NEWTRANX_SHOW_PLUGIN": function() {
                Bind_Common_Function.btnSwitch(1);
                Bind_Common_Function.initParams(params);
                Bind_Common_Function.initSettings();
                Bind_Common_Function.initUserInfo();
                if(SETTING_INFO.i18n_choice_set == 'on') {
                    $('.one').show()
                    $('.edition').hide()
                    Bind_Common_Function.initParams(params);
                    $('.i18n_choice').click(function () {
                        var $this = $(this)
                        SETTING_INFO.i18n_choice_set = 'off'
                        SETTING_INFO.i18n_lang_option = $this.attr('data-value')
                        Bind_Common_Command._NEWTRANX_MODIFY_SETTINGSINFO()

                        $('.one').hide()
                        $('.edition').show()
                        Bind_Common_Function.initI18n(SETTING_INFO.i18n_lang_option)
                    })
                } else {
                    $('.one').hide()
                    $('.edition').show()
                	Bind_Common_Function.initI18n(SETTING_INFO.i18n_lang_option)
				}

            },
            //插件自动弹出
            "NEWTRANX_AUTO_PLUGIN": function() {
                Bind_Common_Function.btnSwitch(1);
            },
			//设置界面中的语言
			"NEWTRANX_SET_LANGUAGE": function() {
                Bind_Common_Function.newtranxSetLanguage(t);
			},
			//文本翻译成功
			"NEWTRANX_TRANSLATE_TEXT_RESULT": function () {
				if(!params.data) return
                $('#text_trans_btn').removeClass('translating');
				$('#target_text').text(params.data)
            },
			//弹窗
			"NEWTRANX_TIPS_MESSAGE": function () {
				Bind_Common_Function.tipsMessage(params.tipParams)
            },
			//查看原文
			"NEWTRANX_LOAD_SOURCE_BUTTON": function() {
                Bind_Common_Function.btnSwitch(2);
			},
			//查看译文
			"NEWTRANX_LOAD_TARGET_BUTTON": function() {
                Bind_Common_Function.btnSwitch(1);
			},
			//tips
			"NEWTRANX_TIPS": function() {
                Bind_Common_Function.tipsDelay(t.data.content);
			},
            //登录结果
            "NEWTRANX_LOGIN_SUCCESS": function() {
                SETTING_INFO = params.SETTING_INFO
                //展示登录结果
                if(SETTING_INFO.user_is_login == 'on' && $('#loginForm').hasClass('disb')){
                    $('[data-toggle="loginForm"]').click()
                }
                if(SETTING_INFO.user_is_login != 'on' && $('#loginForm').hasClass('disb') && params.loginResult == 'fail') {
                    $('.login_error P').show()
                    return
                }
                //初始化用户信息
                Bind_Common_Function.initUserInfo()
            },
		}
		arrFun[t.data.action]();
	}, false);
}
load_button();