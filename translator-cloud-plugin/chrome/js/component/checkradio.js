+ function ($) {
    'use strict';

    var toggle = '[data-toggle="checkRadio"]'
    var ToggleCheckRadio = function (element) {
        this.element = $(element)
    }

    ToggleCheckRadio.prototype.toggle = function (e) {
        var $this = $(this)

        var name = $this.data('name');
        if(!name) return

        $('[data-name="'+name+'"]').removeClass('on')
        $this.addClass('on')
        $('#lication_btn').addClass('isSubmit')
    }

    $(document).on('click.checkRadio.data-api', toggle, ToggleCheckRadio.prototype.toggle)
} (jQuery)