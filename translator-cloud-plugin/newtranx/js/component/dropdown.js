+ function($) {
    'use strict';

    var toggle = '[data-toggle="dropdown"]'
    var Dropdown = function(element) {
        $(element).on('click.dropdown', this.toggle)
    }

    function getParent($this) {
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = selector && $(selector)

        return $parent && $parent.length ? $parent : $this.parent()
    }

    function clearMenus(e) {
        if (e && e.which === 3) return
        $(toggle).each(function() {
            var $this = $(this)
            var $parent = getParent($this)
            var relatedTarget = {
                relatedTarget: this
            }

            if (!$parent.hasClass('open')) return

            if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

            $parent.removeClass('open')

			Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
        })
    }

    function clearAlert(e) {
        //设置菜单
        if(e) {
            var $this = $(e.target);
            var $wrap = $('#settings');
            var $thisWrap = $this.parents('#settings')
            var close = '[data-toggle="closeSettings"]'
            if($wrap.hasClass('open') && $thisWrap.is($wrap) && !$(close).is($this)) return
        }
        //登录表单
        if(e) {
            var $this = $(e.target);
            var $wrap = $('#loginForm');
            var $thisWrap = $this.parents('#loginForm')
            var close = '[data-toggle="closeLoginForm"]'
            if($wrap.hasClass('disb') && $thisWrap.is($wrap) && !$(close).is($this)) return
            $wrap.removeClass('disb')
        }
        //下拉选项
        var idArr = ["select_srcl", "select_tgtl", "select_subject", "settings"];
        for (var i = 0; i < idArr.length; i++) {
            $('#' + idArr[i]).removeClass('open')
        }

        Bind_Common_Function.initSettings()
        Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
    }

    Dropdown.prototype.toggle = function(e) {
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        clearAlert()
        var $parent = getParent($this)
        if($parent.attr('data-disable')) return;
        $parent.toggleClass('open')

        if($parent.hasClass('open')) {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN('on')
        } else {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
        }
    }

    Dropdown.prototype.toggleOpt = function(e) {
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        clearAlert()
        var $menu = $this.closest('.dropdown_menu')
        $menu.find('.options').each(function(i, opt) {
            $(opt).removeClass('on')
        })
        $this.addClass('on')
        var text = $this.text()
        var data_value = $this.attr('data-value')
        $this.parents('.dropdown').find('.option_text').attr('data-value', data_value)
        $this.parents('.dropdown').find('.option_text').text(text)
        $this.parents('.dropdown').find('.option_text').attr('title',text)
    }

    $(document).on('click.dropdown.data-api', clearAlert)
        .on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('click.dropdown.data-api', '.options', Dropdown.prototype.toggleOpt)
}(jQuery)