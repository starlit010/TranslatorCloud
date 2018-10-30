+ function ($) {
    'use strict';

    var toggle = '[data-toggle="toggleSettings"]'
    var close = '[data-toggle="closeSettings"]'
    var open = '[data-toggle="openSettings"]'
    var ToggleSettings = function (element) {
        this.element = $(element)
    }

    function getWrap($this) {
        var tar = $this.data('target')
        if (!tar) {
            tar = 'settings'
        }
        var $wrap = $this.parents('.' + tar)
        return $wrap && $wrap.length ? $wrap : $this.parent()
    }

    ToggleSettings.prototype.toggle = function (e) {
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        var tar = $this.data('target')
        if (!tar) {
            tar = 'settings'
        }

        var $wrap = $this.parents('.' + tar)
        if (!$wrap) return
        $wrap.toggleClass('open')

        if($wrap.hasClass('open')) {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN('on')
        } else {
            Bind_Common_Command._WINDOW_NEWTRANX_FULL_SCREEN()
        }

        Bind_Common_Function.initSettings()
        // var $content = $wrap.children('.settings_content');
        // if (!$content) return

    }

    $(document).on('click.toggleSettings.data-api', toggle, ToggleSettings.prototype.toggle)
} (jQuery)