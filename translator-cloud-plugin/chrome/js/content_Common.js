//#####---------------------全局变量的定义--------------------------------------------------------------------------------------------------------------
//源语言
var NewTranx_Source_language = "";
//目标语言
var NewTranx_Target_language = window.navigator.language;
NewTranx_Target_language = NewTranx_Target_language.indexOf('-') > -1
    ? NewTranx_Target_language.split('-')[0].toLowerCase() : NewTranx_Target_language.toLowerCase();
//总数统计
var total_number_of_content = 0;
//请求的子的个数
var request_iter = 0;
//原文数组
var sourceMap = {};
//译文数组
var targetMap = {};
//
var dict = {};
var list_length = 45;

//基本设置
var SETTING_INFO;
//源语言
var languages = {
    "zh": {
        "zh": "中文简体",
        "en": "英文",
        "hk": "中文繁体",
        "ru": "俄语",
        "ar": "阿拉伯语",
        "es": "西班牙语",
        "ja": "日语",
        "ko": "韩语",
        "pt": "葡萄牙语",
        "ug": "维语",
        "cs": "捷克语"
    },
    "en": {
        "zh": "Chinese simplified",
        "en": "English",
        "hk": "Chinese traditional",
        "ru": "Russian",
        "ar": "Arabic",
        "es": "Spanish",
        "ja": "Japanese",
        "ko": "Korean",
        "pt": "Portuguese",
        "ug": "Uygur",
        "cs": "Czech language"
    }
};
var NewTranx_Subject = 'common';
//目标语言
var supportLang = {
    "zh": ["en", "ug", "ja", "ko", "ru", "ar"],
    "en": ["zh", "es", "pt", "cs", "hk", "ar"],
    "hk": ["en", "ja", "ko", "ru", "ar"],
    "ru": ["zh", "hk"],
    "ar": [ "zh", "en", "hk"],
    "es": ["en"],
    "ja": ["zh", "hk"],
    "ko": ["zh", "hk"],
    "pt": ["en"],
    "ug": ["zh"],
    "cs": ["en"]
};
//领域
var supportSubject = {
    "zh": {
        "en-zh": {
            "common": "通用",
            "news": "新闻",
            "law": "法律",
            "patent": "专利",
            "engine": "工程",
            "spoken": "口语",
            "medicine": "医疗",
            "finance": "财经"
        },
        "default": {
            "common": "通用"
        }
    },
    "en": {
        "en-zh": {
            "common": "common",
            "news": "news",
            "law": "law",
            "patent": "patent",
            "engine": "engine",
            "spoken": "spoken",
            "medicine": "medicine",
            "finance": "finance"
        },
        "default": {
            "common": "common"
        }
    }
};
//插件对象
var $newtranxtool,
    st,
    mutationObserver,//动态监听的对象
    isTranslate = false,//是否翻译的状态
    auto_flag = true;
//自定义定时，（属于放大镜）
var diySt = null;
function diyTimeOut(callBack, s) {

    clearTimeout(diySt);
    diySt = null;

    s = !!s ? s : 500;
    diySt = setTimeout(function() {
        callBack();
    }, s)
}

var Content_Common_Commond = {
    //手动显示插件
    "_NEWTRANX_SHOW_PLUGIN": function () {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_SHOW_PLUGIN",
            SETTING_INFO: SETTING_INFO,
            languages: languages,
            supportLang: supportLang,
            supportSubject: supportSubject
        }, "*");
    },
    //设置语言
    "_NEWTRANX_SET_LANGUAGE": function () {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_SET_LANGUAGE",
            sourceLang: NewTranx_Source_language,
            targetLang: NewTranx_Target_language
        }, "*");
    },
    //登录结果
    "_NEWTRANX_LOGIN_SUCCESS": function (isLogin, data, loginResult) {
        //成功
        if(!!data && !!data.token) {
            SETTING_INFO.user_is_login = 'on';
            if(!!data.data.portrait) {
                data.data.portrait = au.portrait + data.data.portrait;
            }
            SETTING_INFO.user_info = data.data;
            SETTING_INFO.user_token = data.token
        } else {
            SETTING_INFO.user_is_login = 'off';
            SETTING_INFO.user_info = '';
            SETTING_INFO.user_token = ''
        }
        //保存信息
        Chrome_Content_Common_Commond._setSettingInfo();
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_LOGIN_SUCCESS",
            SETTING_INFO: SETTING_INFO,
            loginResult: loginResult
        }, "*");
    },
    //文本翻译完成
    "_NEWTRANX_TRANSLATE_TEXT_RESULT": function (translation_result) {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_TRANSLATE_TEXT_RESULT",
            data: translation_result
        }, "*");
    },
    //查看译文
    "_NEWTRANX_LOAD_TARGET_BUTTON": function () {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_LOAD_TARGET_BUTTON"
        }, "*");
    },
    //弹窗
    "_NEWTRANX_TIPS_MESSAGE": function (tipParams) {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_TIPS_MESSAGE",
            tipParams: tipParams
        }, "*");
    },
    //查看原文
    "_NEWTRANX_LOAD_SOURCE_BUTTON": function () {
        var frm = document.getElementById("newtranxtool");
        frm.contentWindow.postMessage({
            action: "NEWTRANX_LOAD_SOURCE_BUTTON"
        }, "*");
    },
    "_NEWTRANX_TIPS": function (content) {
        document.getElementById("newtranxtool").contentWindow.postMessage({
            action: "NEWTRANX_TIPS",
            content: content
        }, "*");
    }
};

var Chrome_Content_Common_Commond = {
    //store设置
	"_setSettingInfo": function (data) {
		if(!!data) {
            SETTING_INFO = data
		}
		//划词翻译
		if(SETTING_INFO.select_on_off === 'on') {
		    $(document).mouseup(Content_Common_Function.addNewtranxBox)
        } else {
            Content_Common_Function.removeNewtranxBox();
            $(document).mouseup(null)
        }
        chrome.runtime.sendMessage({
            action: "setSettingInfo",
            params: SETTING_INFO
        }, function(response) { })
    },
    "_getPicture": function () {
        chrome.runtime.sendMessage({
            action: "getPicture"
        }, function (response) { });
    }
};

var percentage = 0;
var list_iter = 0;
var list_total = 0;
var translation_list = [];
var translation_node = [];

var Content_Common_Function = {
    //插件样式参数
    "_style_screen_base":{
        position: "fixed",
        top: 0,
        zIndex: 9999999999,
        border: '0px'
    },
    "_style_body_open": {
        marginTop: "50px",
        position: "relative",
    },
    "_style_body_close": {
        marginTop: 0,
        position: '',
    },
    "_style_screen_on": {
        right: 0,
        width: "338px",
        height: "100%"
    },
    "_style_screen_off": {
        left: 0,
        width: "100%",
        height: "50px"
    },
    "_style_screen_full": {
        width: "100%",
        height: "100%"
    },
    //获得插件的jquery对象
    "_get_newtranxtool": function() {
        return $('#newtranxtool');
    },
    //插件是否存在
    "_is_newtranx_plugin":function () {
        var $newtranxtool = this._get_newtranxtool();
        return $newtranxtool.length > 0;
    },
    //手动弹出插件
    "_show_newtranx_plugin": function () {
        if(this._is_newtranx_plugin()) {
            this.remove_newtranx_plugin();
            return false;
        }
        const promise = Promise.all([this.setSubject(), this.setSrclLang()]);
        promise.then(() => {
            this._show_plugin();
        });
    },
    //自动弹出插件
    "_auto_newtranx_plugin": function () {
        if(!auto_flag) return false;
        auto_flag = false;
        const promise = Promise.all([this.setSubject(), this.setSrclLang()]);
        promise.then(() => {
            this._show_plugin();
        });
    },
    //手动显示插件，自动显示插件
    "_show_plugin": function () {
        var $doc = $(document),
            offSrc = "plugin.html",
            onSrc = "plugin_crossScreen.html";
        //判断是否启动划词翻译
        if(SETTING_INFO.select_on_off === 'on'){
            $doc.mouseup(Content_Common_Function.addNewtranxBox)
        } else {
            $doc.mouseup(null)
        }
        if(SETTING_INFO.screen_vh === 'on') {
            this._showPlugin(onSrc)
        } else {
            $(document.body).css(this._style_body_open);
            this._showPlugin(offSrc)
        }
        Content_Common_Function.dayTimeOut();
    },
    //显示插件  （横屏和竖屏有稍稍的差异，差异部分提取了出来。整体只有show_newtranx_plugin方法会用到）
    "_showPlugin": function (diffSrc) {
        $(document.body).append(
            $("<iframe>", {
                id: "newtranxtool",
                style: "",
                text: "暂不支持该语言对翻译!",
                scrolling: 'no',
                src:  chrome.extension.getURL(diffSrc)})
        );
        $newtranxtool = this._get_newtranxtool();
        $newtranxtool.css(this._style_screen_base);
        //设置背景的大小
        this._windowFullScreen_off();
        console.log('_NEWTRANX_SHOW_PLUGIN start');
        $newtranxtool.load(function () {
            console.log('_NEWTRANX_SHOW_PLUGIN end');
            Content_Common_Commond._NEWTRANX_SHOW_PLUGIN();
            Content_Common_Commond._NEWTRANX_SET_LANGUAGE();
            Content_Common_Function.userInfo();
        })
    },
    "_windowFullScreen_on": function () {
        $newtranxtool.css(this._style_screen_full)
    },
    "_windowFullScreen_off": function () {
        if(SETTING_INFO.screen_vh === 'on') {
            $newtranxtool.css(this._style_screen_on);
            if(SETTING_INFO.i18n_lang_option === 'zh') {
                $newtranxtool.css('width', '338px')
            } else {
                $newtranxtool.css('width', '408px')
            }
        } else {
            $newtranxtool.css(this._style_screen_off)
        }
    },
    "_windowFullScreen_control": function (params) {
        if(params.fullScreen && params.fullScreen === 'on'){
            Content_Common_Function._windowFullScreen_on()
        } else {
            Content_Common_Function._windowFullScreen_off()
        }
    },

    //======================================
    //原文回填
    "Suffer_Source": function () {
        this.walkTheDOM(document.body, function(node) {
            if (node.nodeType === 3) {
                var text = node.data.trim();
                var parent = node.parentNode;
                if (parent.nodeName !== "SCRIPT" &&
                    parent.nodeName !== "NOSCRIPT" &&
                    parent.nodeName !== "STYLE" &&
                    parent.nodeName !== 'TEXTAREA' &&
                    parent.nodeName !== 'PRE' &&
                    parent.nodeName !== 'CODE' &&
                    parent.id !== 'newtranxbox' &&
                    parent.id !== 'newtranxtips') {
                    if (text.length > 0) {
                        try {
                            JSON.parse(text.replace("'", "").replace('"', ''));
                        } catch (err) {
                            term_translation = targetMap[text];
                            if (term_translation) {
                                node.data = term_translation;
                            }
                        }
                    }
                }
            }
        });
        //发送“查看译文”消息
        var frm = document.getElementById("newtranxtool");
        frm.contentWindow.postMessage({
            action: "NEWTRANX_LOAD_TARGET_BUTTON"
        }, "*");
        //移除动态监听
        if(!!mutationObserver){
            mutationObserver.disconnect();
        }
    },
    //译文回填
    "Suffer_Target": function () {
        Content_Common_Function.walkTheDOM(document.body, function(node) {
            if (node.nodeType === 3) {
                var text = node.data.trim();
                var parent = node.parentNode;
                if (parent.nodeName !== "SCRIPT" &&
                    parent.nodeName !== "NOSCRIPT" &&
                    parent.nodeName !== "STYLE" &&
                    parent.nodeName !== 'PRE' &&
                    parent.nodeName !== 'CODE' &&
                    parent.nodeName !== 'TEXTAREA' &&
                    parent.id !== 'newtranxbox' &&
                    parent.id !== 'newtranxtips') {
                    if (text.length > 0) {
                        try {
                            JSON.parse(text.replace("'", "").replace('"', ''));
                        } catch (err) {
                            var term_translation = sourceMap[text];
                            if (term_translation) {
                                node.data = term_translation;
                            }
                        }
                    }
                }
            }
        });
        //发送“查看原文”消息
        Content_Common_Commond._NEWTRANX_LOAD_SOURCE_BUTTON();
    },
    //翻译按钮，开始翻译
    "transBtnClick": function () {
        console.info('The souce language is ' + NewTranx_Source_language + ' and the target language is ' + NewTranx_Target_language);
        console.info('total_number_of_content:\t' + total_number_of_content);
            percentage = 0;
            list_iter = 0;
            list_total = 0;
            translation_list = [];
            translation_node = [];
            request_iter = 0;
        this.walkTheDOM(document.body, function(node) {
            if (node.nodeType === 3) { // Is it a Text node?
                var text = node.data.trim();
                var parent = node.parentNode;
                if (parent.nodeName !== "SCRIPT" &&
                    parent.nodeName !== "NOSCRIPT" &&
                    parent.nodeName !== "STYLE" &&
                    parent.nodeName !== 'TEXTAREA' &&
                    parent.nodeName !== 'PRE' &&
                    parent.nodeName !== 'CODE' &&
                    parent.id !== 'newtranxbox' &&
                    parent.id !== 'newtranxtips') {
                    if (text.length > 0 && text.length < 5120) {
                        try {
                            JSON.parse(text.replace("'", "").replace('"', ''));
                            request_iter += 1;
                            list_total += 1;
                        } catch (err) {
                            try {
                                var term_translation = dict[text];
                                if (term_translation) {
                                    node.data = term_translation;
                                    sourceMap[term_translation] = text; //存储  “key:译文-->value:原文” 键值对
                                    targetMap[text] = term_translation; //存储 “key:原文-->value:译文” 键值对
                                    request_iter += 1;
                                } else {
                                    translation_list[list_iter] = text;
                                    translation_node[list_iter] = node;
                                    list_iter += 1;
                                    list_total += 1;
                                    if (list_iter == list_length || list_total == total_number_of_content) {
                                        Content_Common_Function.trans_list(NewTranx_Source_language, NewTranx_Target_language, translation_list, translation_node);
                                        list_iter = 0;
                                        translation_list = [];
                                        translation_node = [];
                                    }
                                }
                            } catch (err) {
                                request_iter += 1;
                            }
                        }
                    }
                }
            }
        });
        this.Additional_Translate();
        console.info('total translation request time in the DOM: ' + request_iter);
    },
    "tipsMessage": function (tipParams) {
        tipParams['getDownload'] = au['getDownload']
        Content_Common_Function._windowFullScreen_control({ fullScreen: 'on' });
        Content_Common_Commond._NEWTRANX_TIPS_MESSAGE(tipParams)
    },
    "changeProgress": function () {
        // console.warn('进度统计(未处理)')
        progress = request_iter / total_number_of_content;
        currentpercentage = progress * 100;
        //console.log('current step:' + request_iter + '\t amount:' + total_number_of_content + '\t progress:' + progress);
        if (currentpercentage - percentage >= 1) {
            // progressBar(percentage / 100);
            percentage = currentpercentage - currentpercentage % 1;
        }
        if (progress === 1) {
            // progressBar(progress);
            // 发送“查看原文”消息
            Content_Common_Commond._NEWTRANX_LOAD_SOURCE_BUTTON()
        }
    },
    //移除插件
    "remove_newtranx_plugin": function() {
        var $body = $(document.body),
            $doc = $(document),
            newtranxtool = document.getElementById($newtranxtool.attr('id'));
        $body.css(this._style_body_close)
        newtranxtool.parentNode.removeChild(newtranxtool)
        //移除插件时，移除划词功能
        Content_Common_Function.removeNewtranxBox();
        $doc.mouseup(null);
        //移除动态监听
        if(!!mutationObserver){
            mutationObserver.disconnect();
        }
        //移除登录查询
        if(!!st){
            clearInterval(st);
            st = null;
        }
        console.info("remove_newtranx_plugin");
    },
    //查询用户信息
    "userInfo": function (autoFlag){
        //autoFlag自动触发的为true
        //如果成功获取到用户信息，认为登录成功；否则登录失败，就恢复到游客状态
        service.getUserInfo().success(function (data) {
            if(!!data && !!data.token) {
                if(SETTING_INFO.user_is_login == 'off' && !autoFlag) {
                    SETTING_INFO.day_alert_is = 'on';
                    Content_Common_Function.dayTimeOut();
                }
                Content_Common_Commond._NEWTRANX_LOGIN_SUCCESS('on', data)
            } else {
                Content_Common_Commond._NEWTRANX_LOGIN_SUCCESS()
            }
        }).error(function () {
            Content_Common_Commond._NEWTRANX_LOGIN_SUCCESS()
        })
    },
    //一次登录,获取token
    "userLogin": function(params){
        service.getUserToken({"userName": params.username, "passWord": params.password})
            .success(function (data) {
                if(!data) {
                    console.info("login fail");
                    Content_Common_Commond._NEWTRANX_LOGIN_SUCCESS(null, null, 'fail')
                } else {
                    SETTING_INFO.user_token = data;
                    Content_Common_Function.userInfo()
                }
            }).error(function () {
                Content_Common_Commond._NEWTRANX_LOGIN_SUCCESS(null, null, 'fail')
            })
    },
    "userLogout": function(){
        service.getLogout()
            .success(function (data) {
                console.log(data);
            }).error(function () {})
    },
    //领域的获取
    "setSubject": function () {
        const promise = new Promise(function(resolve, reject){
            service.getSubject()
                .success(function (data) {
                    console.info("setSubject, subject: " + JSON.stringify(data));
                    if(!!data) {
                        supportSubject = data
                    }
                    resolve(data);
                }).error(function (data) {
                    resolve(data);
                });
        });
        return promise;
    },
    //设置语言   包含callback回调
    "setSrclLang": function () {
        const promise = new Promise(function(resolve, reject){
            service.detectLang({'text': document.title})
                .success(function(data) {
                    console.info("delectLang, data:" + JSON.stringify(data));
                    if(!!data.lang) {
                        NewTranx_Source_language = data.lang
                    }
                    resolve(data);
                }).error(function (data) {
                    resolve(data);
                });
        });
        return promise;
    },
    //get OS
    "get_user_system": function () {
        var os = navigator.platform;
        var userAgent = navigator.userAgent;
        var info = "";
        if (os.indexOf("Win") > -1) {
            if (userAgent.indexOf("Windows NT 5.0") > -1) {
                info += "Win2000";

            } else if (userAgent.indexOf("Windows NT 5.1") > -1) {
                info += "WinXP";
            } else if (userAgent.indexOf("Windows NT 5.2") > -1) {
                info += "Win2003";
            } else if (userAgent.indexOf("Windows NT 6.0") > -1) {
                info += "WindowsVista";
            } else if (userAgent.indexOf("Windows NT 6.1") > -1 || userAgent.indexOf("Windows 7") > -1) {
                info += "Win7";
            } else if (userAgent.indexOf("Windows NT 6.2") > -1) {
                info += "Win8";
            } else if (userAgent.indexOf("Windows NT 6.3") > -1) {
                info += "Win8.1";
            } else if (userAgent.indexOf("Windows NT 10") > -1) {
                info += "Win10";
            } else {
                info += "Others";
            }

        } else if (os.indexOf("Mac") > -1) {
            info += "Mac";
        } else if (os.indexOf("X11") > -1) {
            info += "Unix";
        } else if (os.indexOf("Linux") > -1) {
            info += "Linux";
        } else {
            info += "Other";
        }
        return info;
    },
    //移除划词翻译的盒子
    "removeNewtranxBox": function () {
        var $newtranxbox = $('#newtranxbox');
        if ($newtranxbox.length < 1) return
        $newtranxbox.remove();
    },
    //添加划词翻译的盒子
    "addNewtranxBox": function (ev) {
        var $parentNode = $(ev.target).closest("#newtranxbox");
        if($parentNode.length > 0) return

        var selectText = Content_Common_Function.getSelectionText();
        if (selectText.replace(/(^\s*)|(\s*$)/g, "").length > 0 && !isTranslate) {
            var $newtranxbox = $('#newtranxbox');
            if ($newtranxbox.length > 0) {
                $newtranxbox.remove();
            }
            var ev = ev || window.event,
                x = 0,
                y = 0,
                ph = $(document).height(),
                pw = $(document).width();
            if (ev.pageX || ev.pageY) {
                x = ev.pageX;
                y = ev.pageY;
            } else {
                x = ev.clientX + document.body.scrollLeft - document.body.clientLeft;
                y = ev.clientY + document.body.scrollTop - document.body.clientTop;
            }
            if((x+360) > pw){
                x = pw - 360;
            }
            var left = ev.clientX,
                top = ev.clientY;
            var baseStyle = {
                    position: 'absolute',
                    left: x + 'px',
                    top: y + 'px',
                    height: '210px',
                    width: '350px',
                    zIndex: 2147483647,
                    border: '1px solid #0093D5',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    borderRadius: '5px',
                    boxShadow: '0px 0px 5px #0093D5'
                };
            $('body').append(
                $('<div>', {
                    charset: 'utf-8',
                    id: 'newtranxbox',
                    name: 'newtranxbox'
                })
            );
            var $newtranxbox = $('#newtranxbox')
            $newtranxbox.css(baseStyle)
            var childStr =  '<div style="margin-top:5px;padding-left:5px;">选择语言：<select id="targetLanguage"></select></div>' +
                '<div id="transRes" style="margin:0 auto;margin-top:10px;padding-left:5px;padding-top:5px;font-size:14px;width:93%;height:140px;overflow:auto;border:1px solid lightgrey;border-radius:5px;cursor:text;">' +
                    '<div style="color:gray;margin-top:60px;text-align:center;font-size:12px;">翻译中 . . . </div>' +
                '</div>' +
                '<div style="color:#999999;margin-top:0px;margin-left:10px;font-size:12px;width:340px;position:relative;font-family:微软雅黑;">翻译内容由博雅提供' +
                '<a href="http://www.newtranx.com" target="blank_" text-align="right" style="color:#000099;position:absolute;right:10px;">发现更多精彩</a></div>';
            $newtranxbox.append(childStr)
            //动态追加 下拉列表
            for (var a in languages ) {
                if(!!a && a == NewTranx_Target_language) {
                    $newtranxbox.find('#targetLanguage').append("<option value='"+a+"' selected>"+languages[SETTING_INFO.i18n_lang_option][a]+"</option>");
                } else {
                    $newtranxbox.find('#targetLanguage').append("<option value='"+a+"'>"+languages[SETTING_INFO.i18n_lang_option][a]+"</option>");
                }
            }
            $newtranxbox.find('#targetLanguage').append("<option value='und'  style='display:none' >--</option>");
            $newtranxbox.find('#targetLanguage').change(function () {
                Content_Common_Function.transSelectText(NewTranx_Source_language, $newtranxbox.find('#targetLanguage').val(), selectText);
            })
            //先移除，再绑定
            $newtranxbox.mousemove(function () {
                document.onclick = null
                document.onmouseup = null
            })
            $newtranxbox.mouseout(function() {
                document.onmouseup = Content_Common_Function.addNewtranxBox;
            });
            //@TODO 设置目标语言，逻辑不太一样了
            // NewTranx_Target_language

            Content_Common_Function.transSelectText(NewTranx_Source_language, NewTranx_Target_language, selectText);
            //@TODO 为啥要重置语言？
            // Content_Common_Commond._NEWTRANX_SET_LANGUAGE();

        } else {
            //监听到鼠标在newtranxbox里时，不关闭box
            Content_Common_Function.removeNewtranxBox()
        }
    },
    //遍历dom树
    "walkTheDOM": function (node, func) {
        func(node);
        node = node.firstChild;
        while (node) {
            this.walkTheDOM(node, func);
            node = node.nextSibling;
        }
    },
    //统计总共的文本节点数
    "get_total_number_of_translation": function () {
        total_number_of_content = 0;
        this.walkTheDOM(document.body, function(node) {
            if (node.nodeType === 3) { // Is it a Text node?
                var text = node.data.trim();
                var parent = node.parentNode;
                if (parent.nodeName != "SCRIPT" &&
                    parent.nodeName != "NOSCRIPT" &&
                    parent.nodeName != "STYLE" &&
                    parent.nodeName != 'TEXTAREA' &&
                    parent.nodeName != 'PRE' &&
                    parent.nodeName != 'CODE' &&
                    parent.id != 'newtranxbox' &&
                    parent.id != 'newtranxtips') {
                    if (text.length > 0 && text.length < 5120) {
                        total_number_of_content += 1;
                    }
                }
            }
        });
        console.info(total_number_of_content);
        return total_number_of_content;
    },
    //监听dom元素的改变
    "Additional_Translate": function () {
        var whatToObserve = {
            childList: true,
            attributes: true,
            subtree: true,
            attributeOldValue: true,
            attributeFilter: ['class', 'style']
        };
        mutationObserver = new MutationObserver(function(mutationRecords) {
            for (var p = 0; p < mutationRecords.length; p++) {
                var mutationRecord = mutationRecords[p];
                if (mutationRecord.type === 'childList') {
                    if (mutationRecord.addedNodes.length > 0) {
                        additional_request_iter = 0;
                        for (var i = 0; i < mutationRecord.addedNodes.length; i++) {
                            Content_Common_Function.walkTheDOM(mutationRecord.addedNodes[i], function(node) {
                                if (node.nodeType === 3) {
                                    var text = node.data.trim();
                                    var parentnode = node.parentNode;
                                    if($(parentnode).parents('#newtranxbox').length > 0 ||
                                        $(parentnode).parents('#newtranxtips').length > 0){
                                        return ;
                                    }
                                    try {
                                        JSON.parse(text.replace("'", "").replace('"', ''));
                                    } catch (err) {
                                        if (text.length > 0 && text.length < 5120) {
                                            if (parentnode.nodeName != "SCRIPT" &&
                                                parentnode.nodeName != "NOSCRIPT" &&
                                                parentnode.nodeName != "STYLE" &&
                                                parentnode.nodeName != 'TEXTAREA' &&
                                                parentnode.nodeName != 'PRE' &&
                                                parentnode.nodeName != 'CODE') {
                                                try {
                                                    term_translation = dict[text];
                                                    if (term_translation) {
                                                        node.data = term_translation;
                                                        sourceMap[term_translation] = text; //存储  “key:译文-->value:原文” 键值对
                                                        targetMap[text] = term_translation; //存储 “key:原文-->value:译文” 键值对
                                                        request_iter += 1;
                                                    } else {
                                                        translation_list[list_iter] = text;
                                                        translation_node[list_iter] = node;
                                                        list_iter += 1;
                                                        list_total += 1;
                                                        if (list_iter == list_length || list_total == total_number_of_content) {
                                                            this.list_translation(NewTranx_Source_language, NewTranx_Target_language, translation_list, translation_node);
                                                            list_iter = 0;
                                                            translation_list = [];
                                                            translation_node = [];
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.info("dom change translate error:" + err.message);
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
    },
    //选择其他语言（划词翻译）
    "changeLanguage": function (sour, text) {
        var newTarget = $("targetLanguage").val();
        NewTranx_Source_language = $('#划词翻译目标语言的id').val()
        this.transSelectText(sour, newTarget, text);
    },
    //获取选中文本
    "getSelectionText": function () {
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection && document.selection.createRange) { //if is IE
            return document.selection.createRange().text;
        }
        return "";
    },
    //翻译选中划词文本
    "transSelectText": function (srcl, tgtl, text) {
        service.translate(srcl, tgtl, [text]).success(function (data) {
            if(!data.code) return
            var temp = text;
            if(!!data.data.tgtlText && data.data.tgtlText.length > 0) {
                temp = data.data.tgtlText[0];
            }
            $('#transRes').text(temp);
        }).error(function () {
            $('#transRes').text(text);
        });
    },
    //mt文本翻译
    "trans_mt_text": function (params) {
        service.translate(NewTranx_Source_language, NewTranx_Target_language, [params.text]).then(function (data) {
            console.info('trans_mt_text result:' + data.data.tgtlText[0]);
            Content_Common_Commond._NEWTRANX_TRANSLATE_TEXT_RESULT(data.data.tgtlText[0]);
        });
    },
    //批量翻译
    "trans_list": function (srcl, tgtl, texts, nodes) {
        service.translate(srcl, tgtl, texts).success(function (data) {
            try {
                if(!data.data) {
                    request_iter += list_length;
                    return ;
                }
                // console.info('trans_list' + data);
                var translation_result = data.data.tgtlText;
                for (var i = 0; i < translation_result.length; i++) {
                    var translation = translation_result[i];
                    var text = texts[i];

                    translation_result[i] = translation_result[i] == null ? "" : translation_result[i];
                    if(!!text && text.length > 0 && translation_result[i].replace(/\s+/g, "").length == 0) {
                        translation = text;
                    }
                    sourceMap[text] = translation;
                    targetMap[translation] = text;
                    // console.info(texts[i] + '\t '+ typeof(texts[i]) + '\t translation:\t' + translation_result[i] + '\t ' + typeof(translation_result[i]));
                    nodes[i].data = translation;
                    request_iter += 1;
                    Content_Common_Function.changeProgress();
                }
            } catch (e) {
                request_iter += list_length;
            }
        }).error(function (data) {
            request_iter += list_length;
        });
    },
    //放大镜初始化
    "initPicture": function (screenshotUrl) {

            /**
             * 1. 判断是否有_newtranx_manifier 如果有，就只替换img，移动位置
             */

            var items = {
                magnifierStrength: 2,
                magnifierSize: 425,
                magnifierAA: true,
                magnifierCM: false,
                magnifierShape: 100
            };
            var config = {
                snapshot_url: screenshotUrl,
                magnifier_str: items.magnifierStrength,
                magnifier_size: items.magnifierSize,
                magnifier_aa: items.magnifierAA,
                magnifier_shape: items.magnifierShape,
                page_zoom: 2
            };
            // Do nothing if a magnifying glass has already been summoned
            if (document.getElementById("_bottom_layer")) {
                $('._magnify_scope').remove();
                $('body').unbind()
                return;
            }
// Create new div for the magnifier
            var _magnify_scope = {
                position: "fixed",
                margin: "0",
                padding: "0",
                border: "0",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                zIndex: 2147483647,
                cursor: "none"
            }

            var _bottom_layer = {
                position: "absolute",
                display: "none",
                cursor: "none",
                outline: "none"
            }
            $('body').after('<div id="_magnify_scope" class="_magnify_scope" style=""><div id="_bottom_layer" tabindex="0"></div></div>');
            $("._magnify_scope").css(_magnify_scope);
            $("._magnify_scope #_bottom_layer").css(_bottom_layer);

//var imageUrl = config.snapshot_url;
//var zoom = config.page_zoom;
//var strength = config.magnifier_str;
//var magniSize = config.magnifier_size/zoom;
//var magAA = config.magnifier_aa;
//var magShape = config.magnifier_shape;
            var imageUrl = config.snapshot_url;
            var zoom = config.page_zoom;
            var strength = config.magnifier_str;
            var magniSize = config.magnifier_size / zoom;
            var magAA = config.magnifier_aa;
            var magShape = config.magnifier_shape;

// Remove the listener since it's no longer needed
//chrome.runtime.onMessage.removeListener(transfer);

// Get the dimension of scrollbars
            var scroll_width = (window.innerWidth - $(window).width());
            var scroll_height = (window.innerHeight - $(window).height());


            var magnifier = document.getElementById("_bottom_layer");
            if (magAA) {
                magnifier.style.imageRendering = "auto";
            } else {
                magnifier.style.imageRendering = "pixelated";
            }
            magnifier.style.borderRadius = magShape + "%";
            magnifier.style.background = "url('" + imageUrl + "') no-repeat";
            magnifier.style.transform = "scale(" + strength + ")";
            magnifier.style.width = magniSize / strength + "px";
            magnifier.style.height = magniSize / strength + "px";
            magnifier.style.boxShadow = "0 0 0 " + 7 / strength + "px rgba(255, 255, 255, 0.85), " +
                "0 0 " + 7 / strength + "px " + 7 / strength + "px rgba(0, 0, 0, 0.25), " +
                "inset 0 0 " + 40 / strength + "px " + 2 / strength + "px rgba(0, 0, 0, 0.25)";
            var $_bottom_layer = $('#_bottom_layer')
            var $_bottom_layerW = $_bottom_layer.width()
            var $_bottom_layerH = $_bottom_layer.height()
            $('._magnify_scope').mousemove(function (e) {
                console.info("e.pageX:" + e.clientX + "; e.pageY:" + e.clientY)
                // Fade-in and fade-out the glass if the mouse is inside the page
                if (e.clientX < $(this).width() - scroll_width - 1 && e.clientY < $(this).height() - scroll_height - 4
                    && e.clientX > 0 && e.clientY > 0) {
                    $_bottom_layer.fadeIn(100);
                    // Focus the bottom layer to allow keypress events
                    $_bottom_layer.focus();
                } else {
                    $_bottom_layer.fadeOut(100);
                }

                if ($_bottom_layer.is(':visible')) {
                    // Calculate the relative position of large image
                    var x_offset = -1 * (e.clientX - $_bottom_layerW / 2) * zoom;
                    var y_offset = -1 * (e.clientY - $_bottom_layerH / 2) * zoom;
                    var bg_position = x_offset / strength + "px " + y_offset / strength + "px";

                    // Move the magnifying glass with the mouse
                    var x_position = e.clientX - $_bottom_layerW / 2;
                    var y_position = e.clientY - $_bottom_layerH / 2;

                    $("#_bottom_layer").css({left: x_position, top: y_position, backgroundPosition: bg_position});
                }
                ;
            });

            // Turn off the application if the user's action imply they want to do so
            $('#_bottom_layer').on('wheel keydown', function(e){
                $('._magnify_scope').remove();
                diyTimeOut(function() {
                    Chrome_Content_Common_Commond._getPicture()
                }, 500);
                return;
            });

            $('#_bottom_layer').on('click', function(e){
                $('._magnify_scope').remove();
                return;
            });

        },
    //表单打开
    "open_url_form": function (url) {
        var $newtranxform = $('#newtranxform');
        if($newtranxform.length > 0) {
            $newtranxform.remove()
        }
        var urlTemp = au[url];
        if(urlTemp.indexOf('?') > -1) {
            urlTemp = urlTemp + "&";
        } else {
            urlTemp = urlTemp + "?";
        }
        urlTemp = urlTemp + "locale=" + SETTING_INFO.i18n_lang_option
        var formHtml = '<form id="newtranxform" action="' + urlTemp + '" method="post" target="_blank">' +
            '<input type="hidden" name="url" value="'+urlTemp+'"/>' +
            '<input type="hidden" name="authorization" value="'+SETTING_INFO.user_token+'"/>' +
            '</form>';
        $(document.body).append(formHtml);
        $newtranxform = $('#newtranxform');
        $newtranxform.submit();
    },
    "getNowFormatDate": function () {
        var date = new Date();
        var seperator1 = "-";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
        return currentdate;
    },
    "dayTimeOut": function () {
        if(SETTING_INFO.day_alert_time < Content_Common_Function.getNowFormatDate()) {
            SETTING_INFO.day_alert_is === 'on'
        }
        if(SETTING_INFO.day_alert_is === 'off') return;
        setTimeout(function () {
            SETTING_INFO.day_alert_is = 'off';
            SETTING_INFO.day_alert_time = Content_Common_Function.getNowFormatDate();
            Chrome_Content_Common_Commond._setSettingInfo(SETTING_INFO);
            //@TODO 查询接口获取系统消息
            service.get_message_system().then(function (data) {
                if(!data.message) return;
                console.info('get_message_system result: ' + JSON.stringify(data));
                Content_Common_Function.tipsMessage(data.message)
            })
        }, 3000)
    }

}

//全部地址信息
var root_url = "https://plugin.newtranx.com", //测试服务器
    plugin_center_root = root_url + "/newtranx", //插件中心
    translate_root = root_url + "/translate",//翻译项目
    cas_root = root_url + "/cas/author",//cas项目
    user_root = root_url + "/user",//用户中心
    usersys_root = root_url + "/ucenter",//用户中心
// var root_url = "https://test.newtranx.com", //测试服务器
//     plugin_center_root = root_url + "/newtranx", //插件中心
//     translate_root = root_url + "/translate",//翻译项目
//     cas_root = root_url + "/cas/author",//cas项目
//     user_root = root_url + "/usercenter",//用户中心
//     usersys_root = root_url + "/usersys",//用户中心接口
    au = {
        "getSourceURL": translate_root + "/lang/chect", //语言检测 api
        "transURL": translate_root + "/v1/translate",  //翻译 api
        "getSystemMessage": translate_root + "/query/message",  //系统消息/非及时消息，
        "getTimelyMessage": translate_root + "/query/timely",   //及时消息
        "getDownload": usersys_root + "/file/download?fileId=",
        "getSubject": translate_root + "/project", //获得通用领域的json

        "www": "http://www.newtranx.com/", //官网地址
        "plugin": "http://plugin.newtranx.com/", //插件主页地址
        "logout": plugin_center_root + "/logout", //退出
        "personal": plugin_center_root + "/v2/center", //个人中心地址
        "buy": plugin_center_root + "/v2/buy", //购买地址
        "messages": plugin_center_root + "/v2/messages",//个人中心，消息
        "forget": user_root + "/user.html#/forget/index?service=" + plugin_center_root + "/v2/center",//忘记密码
        "register": user_root + "/user.html#/register/index?service=" + plugin_center_root + "/v2/center",//注册

        "userInfo": plugin_center_root + "/v2/user/me", //检测是否登录 api 0游客 1普通用户 2vip
        "portrait": usersys_root + "/file/download?fileId=",
        "login": cas_root + "/token", //登录
    };


var service = {
    //获取系统消息
    "get_message_system": function (value) {
        return Content_Ajax.ajaxPostForm(au.getSystemMessage, value);
    },
    //获取统计消息
    "get_message_statistics": function (value) {
        return Content_Ajax.ajaxPostForm(au.getTimelyMessage, value);
    },
    //获取指定文本语言    callback收到响应后调用
    "getSubject": function (value) {
        return Content_Ajax.ajaxPostForm(au.getSubject, value);
    },
    //语言检测
    "detectLang": function (value) {
        return Content_Ajax.ajaxPostForm(au.getSourceURL, value);
    },
    //统一调用翻译接口库（包括 网页翻译，文本翻译，划词翻译）
    "translate": function (srcl, tgtl, texts) {
        var params = {
            srcl: srcl,
            tgtl: tgtl,
            text: JSON.stringify(texts),
            field: NewTranx_Subject,
            browser: SETTING_INFO.browser,
            time: Date.parse(new Date()) / 1000,
        }
        return Content_Ajax.ajaxPostFormAsync(au.transURL, params);
    },
    //获取token
    "getUserToken": function (params) {
        return Content_Ajax.ajaxPostForm(au.login, params);
    },
    //清除session
    "getLogout": function (params) {
        return Content_Ajax.ajaxPostForm(au.logout, params);
    },
    //获取个人信息
    "getUserInfo": function () {
        return Content_Ajax.ajaxPostForm(au.userInfo);
    }
};

var Content_Ajax = {
    _getHeader: function () {
        var result = {};
        result['UID'] = SETTING_INFO.uid;
        if(!SETTING_INFO.user_token) return result;
        result['authorization'] = SETTING_INFO.user_token;
        return result;
    },
    ajaxPostForm: function (path, params) {
        return $.ajax({
            method: "POST",
            url: path,
            headers: this._getHeader(),
            data: params,
            xhrFields: {
                withCredentials: true
            }
        })
    },
    ajaxPostFormAsync: function (path, params) {
        return $.ajax({
            method: "POST",
            url: path,
            headers: this._getHeader(),
            data: params,
            async: true,
            xhrFields: {
                withCredentials: true
            }
        })
    }
};






