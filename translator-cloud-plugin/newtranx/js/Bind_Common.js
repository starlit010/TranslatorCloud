'use strict';
var timeout = null;
var languages,
    supportlang,
    supportsubject,
    setting_info,
    sourcelang,
    targetlang,
    subject,
    istranslate = false,
    auto_translate_flag = true;//是否已经预翻译

var first = true;

var demojson = {
    zh: {
        tourist: '选择“领域”会让翻译结果更加准确哦~要选择质量更好的翻译结果吗？赶快成为vip吧~',
        user: '选择“领域”会让翻译结果更加准确哦~要选择质量更好的翻译结果吗？赶快成为vip吧~',
        notranslate: "您设置了一律不翻译"
    },
    en: {
        tourist: 'our domain-specific mt delivers more accurate translation to you. want a better translated text? join our vip club.',
        user: 'our domain-specific mt delivers more accurate translation to you. want a better translated text? join our vip club.',
        notranslate: "you set it all without translation "
    }
}

var bind_common_function = {



    //初始化参数
    initparams: function (params) {
        setting_info = params.setting_info
        languages = params.languages
        supportlang = params.supportlang
        supportsubject = params.supportsubject
    },
    //初始化设置
    initsettings: function () {
        for (var k in setting_info) {
            var v = setting_info[k];
            if (k.indexof('_on_off') > -1) {
                v == 'on' ? $('#' + k).addclass('on') : $('#' + k).removeclass('on')
                if (k == 'without_translate_on_off') {
                    if (v == 'on') {
                        $('#without_translate_option').show()
                    } else {
                        $('#without_translate_option').hide()
                    }
                }
            } else if (k.indexof('_option') > -1) {
                $('#' + k).find('[data-value]').removeclass('on')
                $('#' + k).find('[data-value="' + v + '"]').addclass('on');
            }
        }
    },
    inituserinfo: function () {
        var subjectswitch = function (e) {
            var key = e.which || e.keycode;
            if(!key) return;
            var tipsparamstourist = {
                content: demojson[setting_info.i18n_lang_option].tourist,
                type: '10'
            }
            var tipsparamsuser = {
                content: demojson[setting_info.i18n_lang_option].user,
                type: '10'
            }
            bind_common_function.tipsmessage(setting_info.user_is_login == 'on' ? tipsparamsuser : tipsparamstourist);
        }
        var $userportrait = $('#userportrait');
        var $logout = $('#logout');
        if (setting_info.user_is_login == 'on') {
            $('#select_subject').show()
            $('.youke').hide()
            $('#settings').show()
            $('#screen_vh').show()
            $userportrait.show()
            $logout.show()
            $('[data-toggle="loginform"]').hide()
            $userportrait.attr('src', setting_info.user_info.portrait)
            //领域
            if(setting_info.user_info.viptype == 2) {
                $('#select_subject').attr('data-disable', null).off('click.subjectswitch')
            } else {
                $('#select_subject').attr('data-disable', true).on('click.subjectswitch', subjectswitch)
            }
        } else {
            for (var k in setting_info.default) {
                setting_info[k] = setting_info.default[k]
            }
            $('#settings').hide()
            $('#screen_vh').hide()
            $('#select_subject').attr('data-disable', true).on('click.subjectswitch', subjectswitch)

            $('[data-toggle="loginform"]').show()
            $userportrait.hide()
            $logout.hide()
        }
    },
    logout: function() {
        setting_info.user_is_login = 'off';
        setting_info.user_info = '';
        setting_info.user_token = '';
        bind_common_command._newtranx_modify_settingsinfo();
        bind_common_command._newtranx_user_logout();
        bind_common_function.inituserinfo();

    },
    //初始化语言
    updatetext: function () {
        'use strict';
        var i18n = $.i18n(), language;
        language = setting_info.i18n_lang_option;
        i18n.locale = language;
        i18n.load('bundle/demo-' + i18n.locale + '.json', i18n.locale).done(
            function () {
                bind_common_function.callback();
            }
        );
    },
    callback: function () {
        var prefix = 'i18n-'
        //text alt title beforecontent
        $("["+prefix+"text]").each(function () {
            var $that = $(this);
            var messagekey = $that.attr(prefix + 'text')
            if (!messagekey) return
            $that.text($.i18n(messagekey));
        });
        $("["+prefix+"title]").each(function () {
            var $that = $(this);
            var messagekey = $that.attr(prefix + 'title')
            if (!messagekey) return
            $that.attr('title', $.i18n(messagekey));
        });
        $("["+prefix+"alt]").each(function () {
            var $that = $(this);
            var messagekey = $that.attr(prefix + 'alt')
            if (!!messagekey) {
                $that.attr('alt', $.i18n(messagekey));
            }
        });
        $("["+prefix+"beforecontent]").each(function () {
            var $that = $(this);
            var messagekey = $that.attr(prefix + 'beforecontent')
            if (!!messagekey) {
                $that.attr('beforecontent', $.i18n(messagekey));
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
            $that.text(languages[setting_info.i18n_lang_option][$that.attr('data-value')])
        })
        select_tgtl.each(function () {
            var $that = $(this)
            $that.text(languages[setting_info.i18n_lang_option][$that.attr('data-value')])
        })
        so.text(languages[setting_info.i18n_lang_option][sov]).attr('data-value', sov)
        to.text(languages[setting_info.i18n_lang_option][tov]).attr('data-value', tov)
        if(!!supportsubject[setting_info.i18n_lang_option][sov + '-' + tov]) {
            fo.text(supportsubject[setting_info.i18n_lang_option][sov + '-' + tov][fov]).attr('data-value', fov)
        }
    },
    initi18n: function () {
        'use strict';
        // enable debug
        $.i18n.debug = true;
        bind_common_function.updatetext();
    },
    //收集表单数据
    getformvalue: function () {
        for (var k in setting_info) {
            if (k.indexof('_on_off') > -1) {
                $('#' + k).hasclass('on') ? setting_info[k] = 'on' : setting_info[k] = 'off'
            } else if (k.indexof('_option') > -1) {
                $('#' + k).find('[data-toggle="checkradio"]').each(function () {
                    if (!$(this).hasclass('on')) return
                    setting_info[k] = $(this).attr('data-value');
                })
            }
        }
    },
    //一律不翻译的判断
    withouttranslatecheck: function () {
        if (setting_info.without_translate_on_off == 'off') return true;
        if (setting_info.without_translate_option != sourcelang) return true;
        bind_common_function.tipsdelay(demojson[setting_info.i18n_lang_option]['notranslate'] + languages[setting_info.i18n_lang_option][sourcelang]);
    },
    //临时消息弹窗，限制15字消息
    tipsdelay: function (content) {
        content = content + ''
        if (content.length > 55) content = content.substr(0, 55);
        cleartimeout(timeout)
        $('#limit_tip').text(content);
        $('#limit_tip').fadein();
        timeout = settimeout(function () {
            $('#limit_tip').fadeout();
        }, 2000);
    },
    //弹窗
    tipsmessage: function (tipparams) {
        if (!tipparams) return
        bind_common_function.hidetipsmessage();
        $('#curtain').show();
        var mes = $('#message');
        mes.addclass('on')
        var tit = mes.find('.title')
        var ban = mes.find('.banner')
        var con = mes.find('.content')
        var detform = mes.find('.detailsform')
        var dethref = mes.find('.detailshref')
        var btnlist = mes.find('.btn_list')
        if (!!tipparams.title)
            tit.text(tipparams.title).show()
        if (!!tipparams.image)
            ban.attr('src', tipparams.getdownload + tipparams.image).show()
        if (!!tipparams.content)
            con.text(tipparams.content).show()
        if(!!tipparams.url && tipparams.url.indexof("http") > -1) {
            dethref.attr('value', tipparams.url).show()
        } else {
            if (setting_info.user_is_login === 'on' && tipparams.type === '0')
                detform.attr('data-value', 'messages').show()
        }
            // det.attr('data-value', tipparams.url).show()
        //控制按钮的显示
        btnlist.find('div').hide()
        if(!!tipparams.type) {
            var type = parseint(tipparams.type)
            if(type < 0 && type > 5) return;
            btnlist.find('.btn' + tipparams.type).show();
        }

        // switch(tipparams.type) {
        //     case 1:
        //         //@todo
        //         btnlist.find('.btn' + tipparams.type).show()
        //         break;
        //     case 2:
        //         //@todo 月使用量
        //         break;
        //     case 2:
        //         //@todo vip预警
        //         break;
        //     case 2:
        //         //@todo vip到期
        //         break;
        //     case 5:
        //         //@todo vip赠送消息
        //         break;
        // }
    },
    //判断显示那个按钮（1翻译 2原文 3译文 4翻译中）
    //增加判断（显示翻译按钮、译文按钮，可以划词翻译；显示原文按钮、翻译中按钮不可以进行划词翻译。）
    btnswitch: function (num) {
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
                istranslate = false;
                break;
            case 2:
                btns.see_srcl.show()
                istranslate = true;
                break;
            case 3:
                btns.see_tgtl.show()
                istranslate = false;
                break;
            case 4:
                btns.transing_btn.show()
                istranslate = true;
                break;
            default:
                istranslate = false;
        }
        bind_common_command._window_newtranx_is_translate();
    },
    //初始化语言对
    newtranxsetlanguage: function (t) {
        sourcelang = t.data.sourcelang
        targetlang = t.data.targetlang
        for (var a in languages[setting_info.i18n_lang_option]) {
            $("#select_srcl .select_center ul").append("<li class='options' data-value='" + a + "'>" + languages[setting_info.i18n_lang_option][a] + "</li>");
        }
        //设置界面中的语言对
        if (!languages[setting_info.i18n_lang_option][sourcelang]) sourcelang = 'zh'
        targetlang = (sourcelang == targetlang) ? 'en' : targetlang;
        var $current = $("#select_srcl").children('.dropdown_menu').find(' ul li[data-value="' + sourcelang + '"]');
        $current.trigger('click');
        $("#targetlang").val(targetlang);

        // bind_common_command._newtranx_translate();
        bind_common_command._newtranx_msg(sourcelang + targetlang);
        //网页预翻译
        if (auto_translate_flag && 'on' == setting_info.web_auto_trans_on_off) {
            //开始翻译
            bind_common_function.btnswitch(4);
            bind_common_command._newtranx_translate();
        }
        //只要初始化一次语言，就不再预翻译
        auto_translate_flag = false;
    },
    hidetipsmessage: function () {
        $('#message').removeclass('on')
        $('#curtain').hide()
        var arrhide = ['.title', '.banner', '.content', '.detailsform', '.detailshref']
        $.each(arrhide, function (idx, val) {
            $('#message').find(val).hide()
        })
    }
}

//content的命令统一发送的地方
var bind_common_command = {
    "port": chrome.runtime.connect(),
    //重置语言
    "_newtranx_reset_language": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_reset_language",
            sourcelang: sourcelang,
            targetlang: targetlang,
            subject: subject
        }, "*");
    },
    //打开窗口
    "_newtranx_window_open": function (urlname) {
        bind_common_command.port.postmessage({
            action: "newtranx_window_open",
            url: urlname
        }, "*");
    },
    "_newtranx_form_open": function (urlname) {
        bind_common_command.port.postmessage({
            action: "newtranx_form_open",
            url: urlname
        }, "*");
    },
    //关闭插件
    "_newtranx_remove_plugin": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_remove_plugin"
        }, "*")
    },
    //翻译
    "_newtranx_translate": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_translate"
        }, "*");
    },
    //是否已经翻译
    "_window_newtranx_is_translate": function () {
        bind_common_command.port.postmessage({
            action: "window_newtranx_is_translate",
            istranslate: istranslate
        }, "*");
    },
    //短文翻译
    "_newtranx_translate_text": function (text) {
        bind_common_command.port.postmessage({
            action: "newtranx_translate_text",
            text: text
        }, "*");
    },
    //修改配置
    "_newtranx_modify_settingsinfo": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_modify_settingsinfo",
            setting_info: setting_info
        }, "*");
    },
    //测试消息
    "_newtranx_msg": function (msg) {
        bind_common_command.port.postmessage({
            action: "msg",
            msg: msg
        }, "*");
    },
    //切换横竖屏
    "_newtranx_screen_vh": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_screen_vh",
            setting_info: setting_info
        }, "*");
    },
    //全屏的控制
    "_window_newtranx_full_screen": function (fullscreen) {
        //有消息弹窗，不关闭
        if ($('#message.on').length > 0) {
            fullscreen = 'on'
        }
        if(setting_info.screen_vh == 'on') {
            if(setting_info.i18n_lang_option == 'zh') {
                $('.plugin').css('width', '330px')
            } else if(setting_info.i18n_lang_option == 'en') {
                $('.plugin').css('width', '400px')
            }
        }
        bind_common_command.port.postmessage({
            action: "window_newtranx_full_screen",
            fullscreen: fullscreen
        }, "*");
    },
    //获取快照
    "_get_picture": function () {
        bind_common_command.port.postmessage({
            action: "get_picture"
        }, "*");
    },
    //查看原文
    "_newtranx_suffer_source": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_suffer_source"
        }, "*")
    },
    //查看原文
    "_newtranx_suffer_target": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_suffer_target"
        }, "*")
    },
    //轮询获取个人信息
    "_newtranx_polling_login": function () {
        bind_common_command.port.postmessage({
            action: "newtranx_polling_login"
        }, "*")
    },
    //用户登录
    "_newtranx_user_login": function (username, password) {
        bind_common_command.port.postmessage({
            action: "newtranx_user_login",
            username: username,
            password: password
        }, "*")
    },
    //用户退出接口
    "_newtranx_user_logout": function (username, password) {
        bind_common_command.port.postmessage({
            action: "newtranx_user_logout"
        }, "*")
    }
}

//事件绑定
function bind_common_bindbutton() {
    //源语言切换
    $("#select_srcl").find(".option_text").bind('domnodeinserted', function (e) {
        var $this = $(this);
        sourcelang = $this.attr('data-value');
        console.info('sourcelang changed:' + sourcelang);
        var tgtlarr = supportlang[sourcelang];
        $("#select_tgtl .select_center ul").empty()
        for (var i = 0; i < tgtlarr.length; i++) {
            $("#select_tgtl .select_center ul").append("<li class='options' data-value='" + tgtlarr[i] + "'>" + languages[setting_info.i18n_lang_option][tgtlarr[i]] + "</li>");
        }
        var $existli = $("#select_tgtl .select_center ul").find('li[data-value="' + targetlang + '"]')
        if ($existli.length < 1) {
            $existli = $("#select_tgtl .select_center ul").find('li:first')
        }
        $existli.trigger('click');
    });
    //目标语言切换
    $("#select_tgtl").find(".option_text").bind('domnodeinserted', function () {
        var $this = $(this);
        targetlang = $this.attr('data-value');
        console.info('targetlang changed: ' + targetlang);

        var subjectjson = "";
        if (supportsubject[setting_info.i18n_lang_option][sourcelang + '-' + targetlang]) {
            subjectjson = supportsubject[setting_info.i18n_lang_option][sourcelang + '-' + targetlang]
        } else {
            subjectjson = supportsubject[setting_info.i18n_lang_option]['default']
        }
        $("#select_subject .select_center ul").empty()
        for (var a in subjectjson) {
            $("#select_subject .select_center ul").append("<li class='options' data-value='" + a + "'>" + subjectjson[a] + "</li>");
        }
        $("#select_subject .select_center ul").find('li:first').trigger('click');

    });
    //领域切换
    $("#select_subject").find(".option_text").bind('domnodeinserted', function () {
        const $this = $(this);
        subject = $this.attr('data-value');
        console.info();("subject: " + subject);
        bind_common_command._newtranx_reset_language()
    });
    //登录个人中心的按钮
    var loginbtn = '[data-toggle="loginform"]';
    var loginbtnother = '[data-open="loginform"]'
    $(loginbtn + ',' + loginbtnother).click(function (e) {
        e.preventdefault()
        e.stoppropagation()

        var $loginform = $('#loginform')
        if (!$loginform) return
        $loginform.toggleclass('disb')
        if($loginform.hasclass('disb')) {
            bind_common_command._window_newtranx_full_screen('on')
        } else {
            bind_common_command._window_newtranx_full_screen()
        }
    })
    // $('#userportrait').click(function () {
    //     var $that = $(this);
    //     bind_common_command._newtranx_msg('已经登录')
    //     var urlname = $that.attr('data-value');
    //     if(!urlname) return
    //     bind_common_command._newtranx_form_open(urlname)
    // })
    $('#logout').click(function () {
        bind_common_function.logout();
    })
    // $('#usermessages').click(function () {
    //     bind_common_command._newtranx_msg('历史消息')
    //     var urlname = $('#usermessages').attr('data-value');
    //     if(!urlname) return
    //     bind_common_command._newtranx_form_open(urlname)
    // })
    $('#login_submit').click(function (e) {
        var username = $('[name="username"]').val()
        var password = $('[name="password"]').val()
        if(!username || !password) return
        bind_common_command._newtranx_user_login(username, password)
    })
    $("body").keydown(function() {
        if (event.keycode == "13") {//keycode=13是回车键；数字不同代表监听的按键不同
            if($('#loginform').hasclass('disb')) {
                var username = $('[name="username"]').val()
                var password = $('[name="password"]').val()
                if(!username || !password) return
                bind_common_command._newtranx_user_login(username, password)
            }
        }
    });
    //获取焦点，删除提示信息
    $('.username input, .password input').focus(function () {
        $('.login_error p').hide()
    })
    //链接弹出（火狐子页面不允许弹出）
    $(".href").click(function (e) {
        var urlname = $(this).attr("value");
        if (!urlname) return
        bind_common_command._newtranx_window_open(urlname)
    })
    //表单链接跳转，需要登陆的地址
    $(".hrefform").click(function (e) {
        var urlname = $(e.target).attr('data-value');
        if(!urlname) return
        bind_common_command._newtranx_form_open(urlname)
    })
    //关闭按钮的事件 有两个
    $(".closeplugin").click(function () {
        bind_common_command._newtranx_remove_plugin()
    })
    //翻译按钮的事件
    $("#trans_btn").click(function () {
        if (!bind_common_function.withouttranslatecheck()) return;
        bind_common_function.btnswitch(4);
        bind_common_command._newtranx_translate();
    })
    //应用设置的按钮
    $('#lication_btn').click(function () {
        if (!$('#lication_btn').hasclass('issubmit')) return
        bind_common_function.getformvalue();
        bind_common_function.updatetext()
        bind_common_command._newtranx_modify_settingsinfo();
        $('#lication_btn').removeclass('issubmit')
    })
    //取消设置的按钮
    // $('#cancel_btn').click(function () {
    //     bind_common_function.initsettings();
    //     $('#lication_btn').removeclass('issubmit')
    // })
    //横竖切换的按钮
    $('#screen_vh').click(function () {
        if (setting_info['screen_vh'] == 'on') {
            setting_info['screen_vh'] = 'off'
        } else if (setting_info['screen_vh'] == 'off') {
            setting_info['screen_vh'] = 'on'
        }
        bind_common_command._newtranx_screen_vh();
    })
    //放大镜
    $("#toggle_glass").click(function (e) {
        bind_common_command._get_picture();
    })
    //短文翻译的按钮
    $('#text_trans_btn').click(function () {
        var text = $('#source_text').text();
        if (!text) return
        $('#text_trans_btn').addclass('translating');
        bind_common_command._newtranx_translate_text(text);
    })
    //原文文本框
    $('#source_text').keydown(function () {
        var text = $('#source_text').text();
        if (!text) {
            $('#target_text').text('')
        }
    })
    //弹窗
    $('#message .closemessage').click(function () {
        bind_common_function.hidetipsmessage();
        bind_common_command._window_newtranx_full_screen()
    })
    //查看原文的按钮
    $("#see_srcl").click(function () {
        bind_common_command._newtranx_suffer_source()
    });
    //查看译文的按钮
    $("#see_trgl").click(function () {
        bind_common_command._newtranx_suffer_target()
    });
}