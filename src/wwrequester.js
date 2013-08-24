(function($) {

function handleClick() {
    alert('clicked');
    alert($('#input').value);
}

$(function(){
    $('#input').click(handleClick);
});
})(jQuery);
