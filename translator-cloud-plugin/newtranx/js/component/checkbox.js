+ function ($) {
    'use strict';

    var toggle = '[data-toggle="checkBox"]'
    var ToggleCheckBox = function (element) {
        this.element = $(element)
    }

    ToggleCheckBox.prototype.toggle = function (e) {
        var $this = $(this)
        $this.toggleClass('on')
        console.info(e.isTrusted);
        $('#lication_btn').addClass('isSubmit')

        if($this.attr('id') != 'without_translate_on_off') return
        if($this.hasClass('on')) {
            $('#without_translate_option').show()
        } else {
            $('#without_translate_option').hide()
        }

    }

    $(document).on('click.checkBox.data-api', toggle, ToggleCheckBox.prototype.toggle)
} (jQuery)