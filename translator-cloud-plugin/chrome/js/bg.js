//点击图标时
chrome.browserAction.onClicked.addListener(function(tab){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.detectLanguage(tab.id, function(language) {//谷歌浏览器使用detectLanguage
            storage.get('custom', function (items) {
                chrome.tabs.sendMessage(tab.id, {
                    action: "show_newtranx_plugin",
                    sourceLanguage: language,
                    SETTING_INFO: items.custom
                }, function(response) { });
            });
        });
    });
});

//更新时
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    // if(true){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.detectLanguage(tab.id, function(language) {//谷歌浏览器使用detectLanguage
                storage.get('custom', function (items) {
                    if(items.custom["auto_pop_on_off"] && items.custom["auto_pop_on_off"] == 'on'){
                        chrome.tabs.sendMessage(tab.id, {
                            action: "auto_newtranx_plugin",
                            sourceLanguage: language,
                            SETTING_INFO: items.custom
                        }, function(response) { });
                    }
                });
            });
        });
});

//修改设置
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var arrFun = {
        //查询配置
        "getSettingInfo": function() {
            storage.get('custom', function (items) {
                sendResponse(items.custom);
            })
        },
        //修改配置
        "setSettingInfo": function() {
            System_Commin_Function.modifySettingsInfo(request.params)
            sendResponse(request.params);
        },
        //获得快照
        "getPicture": function () {
            chrome.tabs.captureVisibleTab({format: "png"}, function(screenshotUrl) {
                var param = {
                    action: "asyn_get_picture_info",
                    screenshotUrl: screenshotUrl
                }
                System_Commin_Function.send_message2Content_execute_function(param)
            })
        }
    }
    arrFun[request.action]();
});

//安装时初始化
chrome.runtime.onInstalled.addListener(function(info) {
    /**
     * 用户配置规则
     * _on_off 结尾是开关单选
     * _option 结尾是单选
     * @type {string}
     */
    var default_settingsInfo = {
        'default': {
            'select_on_off' : 'off',//划词翻译
            'web_auto_trans_on_off' : 'off',//自动翻译
            'auto_pop_on_off' : 'off',//自动弹出
            'without_translate_on_off' : 'off',//不翻译
            'screen_vh' : 'off',//横屏竖屏 VerticalScreen  horizontal
        },
        'i18n_lang_option': 'zh',//国际化选项
        'without_translate_option': 'en',//不翻译选项

        'select_on_off' : 'off',//划词翻译
        'web_auto_trans_on_off' : 'off',//自动翻译
        'auto_pop_on_off' : 'off',//自动弹出
        'without_translate_on_off' : 'off',//不翻译
        'screen_vh' : 'off',//横屏竖屏 VerticalScreen  horizontal

        'i18n_choice_set': 'on',//是否选择国际化
        'uid': '',
        'user_info': '',
        'user_token': '',
        'user_is_login': 'off',
        'browser': 'KSbrowser',//浏览器类型 BaiDubrowser Chrombrowser  FireFoxbrowser KSbrowser QQbrowser  UCbrowser

        day_alert_is: 'on',
        day_alert_time: ''
    }
    new Fingerprint2().get(function(result, componts){
        default_settingsInfo['uid'] = result
        System_Commin_Function.initSettingsInfo(default_settingsInfo);
    });

});

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function(param){
        //modify 消息传送方式修改，action 和 参数放一起
        System_Commin_Function.send_message2Content_execute_function(param)
    });
});




