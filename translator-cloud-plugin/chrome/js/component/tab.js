+ function ($) {
    'use strict';

    var toggle = '[data-toggle="tabs"]'
    var ToggleTab = function (element) {
        this.element = $(element)
    }

    function clearTab(e) {
        $(toggle).find('span').each(function () {
            var $this = $(this)
            $this.removeClass('on')
            $('.' + $this.attr('data-target')).hide();
        })
    }

    ToggleTab.prototype.toggle = function (e) {
        var $this = $(this)
        clearTab()
        var $item = $this.find(e.target)
        $item.addClass('on')
        $('.' + $item.attr('data-target')).show();
    }

    $(document).on('click.ToggleTab.data-api', toggle, ToggleTab.prototype.toggle)
} (jQuery)