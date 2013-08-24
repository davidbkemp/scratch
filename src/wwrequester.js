(function($) {

function handleClick() {
    alert($(this).value());
}

$(function(){
    $('#input').click(handleClick);
});
})(jQuery);
