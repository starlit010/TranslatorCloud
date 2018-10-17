'use strict';
var timeout = null;
var languages,
    supportLang,
    supportSubject,
    SETTING_INFO,
    sourceLang,
    targetLang,
    subject,
    isTranslate = false,
    auto_translate_flag = true;//是否已经预翻译

var first = true;

var demoJson = {
    zh: {
        tourist: '选择“领域”会让翻译结果更加准确哦~要选择质量更好的翻译结果吗？赶快成为VIP吧~',
        user: '选择“领域”会让翻译结果更加准确哦~要选择质量更好的翻译结果吗？赶快成为VIP吧~',
        noTranslate: "您设置了一律不翻译"
    },
    en: {
        tourist: 'Our domain-specific MT delivers more accurate translation to you. Want a better translated text? Join our VIP club.',
        user: 'Our domain-specific MT delivers more accurate translation to you. Want a better translated text? Join our VIP club.',
        noTranslate: "You set it all without translation "
    }
}

var Bind_Common_Function = {
    //初始化参数
    initParams: function (params) {
        SETTING_INFO = params.SETTING_INFO
        languages = params.languages
        supportLang = params.supportLang
        supportSubject = params.supportSubject
    },
    //初始化设置
    initSettings: function () {
        for (var k in SETTING_INFO) {
            var v = SETTING_INFO[k];
            if (k.indexOf('_on_off') > -1) {
                v == 'on' ? $('#' + k).addClass('on') : $('#' + k).removeClass('on')
                if (k == 'without_translate_on_off') {
                    if (v == 'on') {
                        $('#without_translate_option').show()
                    } else {
                        $('#without_translate_option').hide()
                    }
                }
            } else if (k.indexOf('_option') > -1) {
                $('#' + k).find('[data-value]').removeClass('on')
                $('#' + k).find('[data-value="' + v + '"]').addClass('on');
            }
        }
    },
    initUserInfo: function () {
        var subjectSwitch = function (e) {
            var key = e.which || e.keyCode;
            if(!key) return;
            var tipsParamsTourist = {
                content: demoJson[SETTING_INFO.i18n_lang_option].tourist,
                type: '10'
            }
            var tipsParamsUser = {
                content: demoJson[SETTING_INFO.i18n_lang_option].user,
                type: '10'
            }
            Bind_Common_Function.tipsMessage(SETTING_INFO.user_is_login == 'on' ? tipsParamsUser : tipsParamsTourist);
        }
        var $userPortrait = $('#userPortrait');
        var $logout = $('#logout');
        if (SETTING_INFO.user_is_login == 'on') {
            $('#select_subject').show()
            $('.youke').hide()
            $('#settings').show()
            $('#screen_vh').show()
            $userPortrait.show()
            $logout.show()
            $('[data-toggle="loginForm"]').hide()
            $userPortrait.attr('src', SETTING_INFO.user_info.portrait)
            //领域
            if(SETTING_INFO.user_info.vipType == 2) {
                $('#select_subject').attr('data-disable', null).off('click.subjectSwitch')
            } else {
                $('#select_subject').attr('data-disable', true).on('click.subjectSwitch', subjectSwitch)
            }
        } else {
            for (var k in SETTING_INFO.default) {
                SETTING_INFO[k] = SETTING_INFO.default[k]
            }
            $('#settings').hide()
            $('#screen_vh').hide()
            $('#select_subject').attr('data-disable', true).on('click.subjectSwitch', subjectSwitch)

            $('[data-toggle="loginForm"]').show()
            $userPortrait.hide()
            $logout.hide()
        }
    },
    logout: function() {
        SETTING_INFO.user_is_login = 'off';
        SETTING_INFO.user_info = '';
        SETTING_INFO.user_token = '';
        Bind_Common_Command._NEWTRANX_MODIFY_SETTINGSINFO();
        Bind_Common_Command._NEWTRANX_USER_LOGOUT();
        Bind_Common_Function.initUserInfo();

    },
    //初始化语言
    updateText: function () {
        'use strict';
        var i18n = $.i18n(), language;
        language = SETTING_INFO.i18n_lang_option;
        i18n.locale = language;
        i18n.load('bundle/demo-' + i18n.locale + '.json', i18n.locale).done(
            function () {
                Bind_Common_Function.callback();
            }
        );
    },
    callback: function () {
        var prefix = 'i18n-'
        //text alt title beforeContent
        $("["+prefix+"text]").each(function () {
            var $that = $(this);
            var messageKey = $that.attr(prefix + 'text')
            if (!messageKey) return
            $that.text($.i18n(messageKey));
        });
        $("["+prefix+"title]").each(function () {
            var $that = $(this);
            var messageKey = $that.attr(prefix + 'title')
            if (!messageKey) return
            $that.attr('title', $.i18n(messageKey));
        });
        $("["+prefix+"alt]").each(function () {
            var $that = $(this);
            var messageKey = $that.attr(prefix + 'alt')
            if (!!messageKey) {
                $that.attr('alt', $.i18n(messageKey));
            }
        });
        $("["+prefix+"beforeContent]").each(function () {
            var $that = $(this);
            var messageKey = $that.attr(prefix + 'beforeContent')
            if (!!messageKey) {
                $that.attr('beforeContent', $.i18n(messageKey));
            }
        });
        var select_srcl = $('#select_srcl ul li')
        var select_tgtl = $('#select_tgtl ul li')
        var select_subject = $('#select_subject ul li')
        var so = $('#select_srcl .option_text')
        var to = $('#select_tgtl .option_text')
        var fo = $('#select_subject .option_text')
        var sov = so.attr('data-value')
        var tov = to.attr('data-value')
        var fov = fo.attr('data-value')
        select_srcl.each(function () {
            var $that = $(this)
            $that.text(languages[SETTING_INFO.i18n_lang_option][$that.attr('data-value')])
        })
        select_tgtl.each(function () {
            var $that = $(this)
            $that.text(languages[SETTING_INFO.i18n_lang_option][$that.attr('data-value')])
        })
        so.text(languages[SETTING_INFO.i18n_lang_option][sov]).attr('data-value', sov)
        to.text(languages[SETTING_INFO.i18n_lang_option][tov]).attr('data-value', tov)
        if(!!supportSubject[SETTING_INFO.i18n_lang_option][sov + '-' + tov]) {
            fo.text(supportSubject[SETTING_INFO.i18n_lang_option][sov + '-' + tov][fov]).attr('data-value', fov)
        }
    },
    initI18n: function () {
        'use strict';
        // Enable debug
        $.i18n.debug = true;
        Bind_Common_Function.updateText();
    },
    //收集表单数据
    getFormValue: function () {
        for (var k in SETTING_INFO) {
            if (k.indexOf('_on_off') > -1) {
                $('#' + k).hasClass('on') ? SETTING_INFO[k] = 'on' : SETTING_INFO[k] = 'off'
            } else if (k.indexOf('_option') > -1) {
                $('#' + k).find('[data-toggle="checkRadio"]').each(function () {
                    if (!$(this).hasClass('on')) return
                    SETTING_INFO[k] = $(this).attr('data-value');
                })
            }
        }
    },
    //一律不翻译的判断
    withoutTranslateCheck: function () {
        if (SETTING_INFO.without_translate_on_off == 'off') return true;
        if (SETTING_INFO.without_translate_option != sourceLang) return true;
        Bind_Common_Function.tipsDelay(demoJson[SETTING_INFO.i18n_lang_option]['noTranslate'] + languages[SETTING_INFO.i18n_lang_option][sourceLang]);
    },
    //临时消息弹窗，限制15字消息
    tipsDelay: function (content) {
        content = content + ''
        if (content.length > 55) content = content.substr(0, 55);
        clearTimeout(timeout)
        $('#limit_tip').text(content);
        $('#limit_tip').fadeIn();
        timeout = setTimeout(function () {
            $('#limit_tip').fadeOut();
        }, 2000);
    },
    //弹窗
    tipsMessage: function (tipParams) {
        if (!tipParams) return
        Bind_Common_Function.hideTipsMessage();
        $('#curtain').show();
        var mes = $('#message');
        mes.addClass('on')
        var tit = mes.find('.title')
        var ban = mes.find('.banner')
        var con = mes.find('.content')
        var detForm = mes.find('.detailsForm')
        var detHref = mes.find('.detailsHref')
        var btnList = mes.find('.btn_list')
        if (!!tipParams.title)
            tit.text(tipParams.title).show()
        if (!!tipParams.image)
            ban.attr('src', tipParams.getDownload + tipParams.image).show()
        if (!!tipParams.content)
            con.text(tipParams.content).show()
        if(!!tipParams.url && tipParams.url.indexOf("http") > -1) {
            detHref.attr('value', tipParams.url).show()
        } else {
            if (SETTING_INFO.user_is_login === 'on' && tipParams.type === '0')
                detForm.attr('data-value', 'messages').show()
        }
            // det.attr('data-value', tipParams.url).show()
        //控制按钮的显示
        btnList.find('div').hide()
        if(!!tipParams.type) {
            var type = parseInt(tipParams.type)
            if(type < 0 && type > 5) return;
            btnList.find('.btn' + tipParams.type).show();
        }

        // switch(tipParams.type) {
        //     case 1:
        //         //@TODO
        //         btnList.find('.btn' + tipParams.type).show()
        //         break;
        //     case 2:
        //         //@TODO 月使用量
        //         break;
        //     case 2:
        //         //@TODO viP预警
        //         break;
        //     case 2:
        //         //@TODO vip到期
        //         break;
        //     case 5:
        //         //@TODO vip赠送消息
        //         break;
        // }
    },
    //判断显示那个按钮（1翻译 2原文 3译文 4翻译中）
    //增加判断（显示翻译按钮、译文按钮，可以划词翻译；显示原文按钮、翻译中按钮不可以进行划词翻译。）
    btnSwitch: function (num) {
        // var $btns = $('.btns')
        //
        // $btns.find('button').hide()
        var btns = {
            "trans_btn": $('#trans_btn'),
            "transing_btn": $('#transing_btn'),
            "see_srcl": $('#see_srcl'),
            "see_tgtl": $('#see_tgtl'),
        }
        for (var btn in btns) {
            btns[btn].hide();
        }
        switch (num) {
            case 1:
                btns.trans_btn.show()
                isTranslate = false;
                break;
            case 2:
                btns.see_srcl.show()
                isTranslate = true;
                break;
            case 3:
                btns.see_tgtl.show()
                isTranslate = false;
                break;
            case 4:
                btns.transing_btn.show()
                isTranslate = true;
                break;
            default:
                isTranslate = false;
        }
        Bind_Common_Command._WINDOW_NEWTRANX_IS_TRANSLATE();
    },
    //初始化语言对
    newtranxSetLanguage: function (t) {
        sourceLang = t.data.sourceLang
        targetLang = t.data.targetLang
        for (var a in languages[SETTING_INFO.i18n_lang_option]) {
            $("#select_srcl .select_center ul").append("<li class='options' data-value='" + a + "'>" + languages[SETTING_INFO.i18n_lang_option][a] + "</li>");
        }
        //设置界面中的语言对
        if (!languages[SETTING_INFO.i18n_lang_option][sourceLang]) sourceLang = 'zh'
        targetLang = (sourceLang == targetLang) ? 'en' : targetLang;
        var $current = $("#select_srcl").children('.dropdown_menu').find(' ul li[data-value="' + sourceLang + '"]');
        $current.trigger('click');
        $("#targetLang").val(targetLang);

        // Bind_Common_Command._NEWTRANX_TRANSLATE();
        Bind_Common_Command._NEWTRANX_MSG(sourceLang + targetLang);
        //网页预翻译
        if (auto_translate_flag && 'on' == SETTING_INFO.web_auto_trans_on_off) {
            //开始翻译
            Bind_Common_Function.btnSwitch(4);
            Bind_Common_Command._NEWTRANX_TRANSLATE();
        }
        //只要初始化一次语言，就不再预翻译
        auto_translate_flag = false;
    },
    hideTipsMessage: function () {
        $('#message').removeClass('on')
        $('#curtain').hide()
        var arrHide = ['.title', '.banner', '.content', '.detailsForm', '.detailsHref']
        $.each(arrHide, function (idx, val) {
            $('#message').find(val).hide()
        })
    }
}

//content的命令统一发送的地方
var Bind_Common_Command = {
    "port": chrome.runtime.connect(),
    //重置语言
    "_NEWTRANX_RESET_LANGUAGE": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_RESET_LANGUAGE",
            sourceLang: sourceLang,
            targetLang: targetLang,
            subject: subject
        }, "*");
    },
    //打开窗口
    "_NEWTRANX_WINDOW_OPEN": function (urlName) {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_WINDOW_OPEN",
            url: urlName
        }, "*");
    },
    "_NEWTRANX_FORM_OPEN": function (urlName) {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_FORM_OPEN",
            url: urlName
        }, "*");
    },
    //关闭插件
    "_NEWTRANX_REMOVE_PLUGIN": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_REMOVE_PLUGIN"
        }, "*")
    },
    //翻译
    "_NEWTRANX_TRANSLATE": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_TRANSLATE"
        }, "*");
    },
    //是否已经翻译
    "_WINDOW_NEWTRANX_IS_TRANSLATE": function () {
        Bind_Common_Command.port.postMessage({
            action: "WINDOW_NEWTRANX_IS_TRANSLATE",
            isTranslate: isTranslate
        }, "*");
    },
    //短文翻译
    "_NEWTRANX_TRANSLATE_TEXT": function (text) {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_TRANSLATE_TEXT",
            text: text
        }, "*");
    },
    //修改配置
    "_NEWTRANX_MODIFY_SETTINGSINFO": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_MODIFY_SETTINGSINFO",
            SETTING_INFO: SETTING_INFO
        }, "*");
    },
    //测试消息
    "_NEWTRANX_MSG": function (msg) {
        Bind_Common_Command.port.postMessage({
            action: "msg",
            msg: msg
        }, "*");
    },
    //切换横竖屏
    "_NEWTRANX_SCREEN_VH": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_SCREEN_VH",
            SETTING_INFO: SETTING_INFO
        }, "*");
    },
    //全屏的控制
    "_WINDOW_NEWTRANX_FULL_SCREEN": function (fullScreen) {
        //有消息弹窗，不关闭
        if ($('#message.on').length > 0) {
            fullScreen = 'on'
        }
        if(SETTING_INFO.screen_vh == 'on') {
            if(SETTING_INFO.i18n_lang_option == 'zh') {
                $('.plugin').css('width', '330px')
            } else if(SETTING_INFO.i18n_lang_option == 'en') {
                $('.plugin').css('width', '400px')
            }
        }
        Bind_Common_Command.port.postMessage({
            action: "WINDOW_NEWTRANX_FULL_SCREEN",
            fullScreen: fullScreen
        }, "*");
    },
    //获取快照
    "_GET_PICTURE": function () {
        Bind_Common_Command.port.postMessage({
            action: "GET_PICTURE"
        }, "*");
    },
    //查看原文
    "_NEWTRANX_SUFFER_SOURCE": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_SUFFER_SOURCE"
        }, "*")
    },
    //查看原文
    "_NEWTRANX_SUFFER_TARGET": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_SUFFER_TARGET"
        }, "*")
    },
    //轮询获取个人信息
    "_NEWTRANX_POLLING_LOGIN": function () {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_POLLING_LOGIN"
        }, "*")
    },
    //用户登录
    "_NEWTRANX_USER_LOGIN": function (username, password) {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_USER_LOGIN",
            username: username,
            password: password
        }, "*")
    },
    //用户退出接口
    "_NEWTRANX_USER_LOGOUT": function (username, password) {
        Bind_Common_Command.port.postMessage({
            action: "NEWTRANX_USER_LOGOUT"
        }, "*")
    }
}

//事件绑定
function Bind_Common_BindButton() {
    //源语言切换
    $("#select_srcl").find(".option_text").bind('DOMNodeInserted', function (e) {
        var $this = $(this);
        sourceLang = $this.attr('data-value');
        console.info('sourceLang changed:' + sourceLang);
        var tgtlArr = supportLang[sourceLang];
        $("#select_tgtl .select_center ul").empty()
        for (var i = 0; i < tgtlArr.length; i++) {
            $("#select_tgtl .select_center ul").append("<li class='options' data-value='" + tgtlArr[i] + "'>" + languages[SETTING_INFO.i18n_lang_option][tgtlArr[i]] + "</li>");
        }
        var $existLi = $("#select_tgtl .select_center ul").find('li[data-value="' + targetLang + '"]')
        if ($existLi.length < 1) {
            $existLi = $("#select_tgtl .select_center ul").find('li:first')
        }
        $existLi.trigger('click');
    });
    //目标语言切换
    $("#select_tgtl").find(".option_text").bind('DOMNodeInserted', function () {
        var $this = $(this);
        targetLang = $this.attr('data-value');
        console.info('targetLang changed: ' + targetLang);

        var subjectJson = "";
        if (supportSubject[SETTING_INFO.i18n_lang_option][sourceLang + '-' + targetLang]) {
            subjectJson = supportSubject[SETTING_INFO.i18n_lang_option][sourceLang + '-' + targetLang]
        } else {
            subjectJson = supportSubject[SETTING_INFO.i18n_lang_option]['default']
        }
        $("#select_subject .select_center ul").empty()
        for (var a in subjectJson) {
            $("#select_subject .select_center ul").append("<li class='options' data-value='" + a + "'>" + subjectJson[a] + "</li>");
        }
        $("#select_subject .select_center ul").find('li:first').trigger('click');

    });
    //领域切换
    $("#select_subject").find(".option_text").bind('DOMNodeInserted', function () {
        const $this = $(this);
        subject = $this.attr('data-value');
        console.info();("subject: " + subject);
        Bind_Common_Command._NEWTRANX_RESET_LANGUAGE()
    });
    //登录个人中心的按钮
    var loginBtn = '[data-toggle="loginForm"]';
    var loginBtnOther = '[data-open="loginForm"]'
    $(loginBtn + ',' + loginBtnOther).click(function (e) {
        e.preventDefault()
        e.stopPropagation()

        var $loginForm = $('#loginForm')
        if (!$loginForm) return
        $loginForm.toggleClass('disb')
        if($loginForm.hasClass('disb')) {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN('on')
        } else {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
        }
    })
    // $('#userPortrait').click(function () {
    //     var $that = $(this);
    //     Bind_Common_Command._NEWTRANX_MSG('已经登录')
    //     var urlName = $that.attr('data-value');
    //     if(!urlName) return
    //     Bind_Common_Command._NEWTRANX_FORM_OPEN(urlName)
    // })
    $('#logout').click(function () {
        Bind_Common_Function.logout();
    })
    // $('#userMessages').click(function () {
    //     Bind_Common_Command._NEWTRANX_MSG('历史消息')
    //     var urlName = $('#userMessages').attr('data-value');
    //     if(!urlName) return
    //     Bind_Common_Command._NEWTRANX_FORM_OPEN(urlName)
    // })
    $('#login_submit').click(function (e) {
        var username = $('[name="username"]').val()
        var password = $('[name="password"]').val()
        if(!username || !password) return
        Bind_Common_Command._NEWTRANX_USER_LOGIN(username, password)
    })
    $("body").keydown(function() {
        if (event.keyCode == "13") {//keyCode=13是回车键；数字不同代表监听的按键不同
            if($('#loginForm').hasClass('disb')) {
                var username = $('[name="username"]').val()
                var password = $('[name="password"]').val()
                if(!username || !password) return
                Bind_Common_Command._NEWTRANX_USER_LOGIN(username, password)
            }
        }
    });
    //获取焦点，删除提示信息
    $('.username input, .password input').focus(function () {
        $('.login_error P').hide()
    })
    //链接弹出（火狐子页面不允许弹出）
    $(".href").click(function (e) {
        var urlName = $(this).attr("value");
        if (!urlName) return
        Bind_Common_Command._NEWTRANX_WINDOW_OPEN(urlName)
    })
    //表单链接跳转，需要登陆的地址
    $(".hrefForm").click(function (e) {
        var urlName = $(e.target).attr('data-value');
        if(!urlName) return
        Bind_Common_Command._NEWTRANX_FORM_OPEN(urlName)
    })
    //关闭按钮的事件 有两个
    $(".closePlugin").click(function () {
        Bind_Common_Command._NEWTRANX_REMOVE_PLUGIN()
    })
    //翻译按钮的事件
    $("#trans_btn").click(function () {
        if (!Bind_Common_Function.withoutTranslateCheck()) return;
        Bind_Common_Function.btnSwitch(4);
        Bind_Common_Command._NEWTRANX_TRANSLATE();
    })
    //应用设置的按钮
    $('#lication_btn').click(function () {
        if (!$('#lication_btn').hasClass('isSubmit')) return
        Bind_Common_Function.getFormValue();
        Bind_Common_Function.updateText()
        Bind_Common_Command._NEWTRANX_MODIFY_SETTINGSINFO();
        $('#lication_btn').removeClass('isSubmit')
    })
    //取消设置的按钮
    // $('#cancel_btn').click(function () {
    //     Bind_Common_Function.initSettings();
    //     $('#lication_btn').removeClass('isSubmit')
    // })
    //横竖切换的按钮
    $('#screen_vh').click(function () {
        if (SETTING_INFO['screen_vh'] == 'on') {
            SETTING_INFO['screen_vh'] = 'off'
        } else if (SETTING_INFO['screen_vh'] == 'off') {
            SETTING_INFO['screen_vh'] = 'on'
        }
        Bind_Common_Command._NEWTRANX_SCREEN_VH();
    })
    //放大镜
    $("#toggle_glass").click(function (e) {
        Bind_Common_Command._GET_PICTURE();
    })
    //短文翻译的按钮
    $('#text_trans_btn').click(function () {
        var text = $('#source_text').text();
        if (!text) return
        $('#text_trans_btn').addClass('translating');
        Bind_Common_Command._NEWTRANX_TRANSLATE_TEXT(text);
    })
    //原文文本框
    $('#source_text').keydown(function () {
        var text = $('#source_text').text();
        if (!text) {
            $('#target_text').text('')
        }
    })
    //弹窗
    $('#message .closeMessage').click(function () {
        Bind_Common_Function.hideTipsMessage();
        Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
    })
    //查看原文的按钮
    $("#see_srcl").click(function () {
        Bind_Common_Command._NEWTRANX_SUFFER_SOURCE()
    });
    //查看译文的按钮
    $("#see_trgl").click(function () {
        Bind_Common_Command._NEWTRANX_SUFFER_TARGET()
    });
}