(function($) {

function handleClick() {
    alert($('#input').value);
}

$(function(){
    $('button').click(handleClick);
});
})(jQuery);
