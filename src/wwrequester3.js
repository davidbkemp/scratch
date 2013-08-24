(function($) {

function handleClick() {
    alert($('#input').val());

    var worker = new Worker('wwworker.js');

    worker.addEventListener('message', function(e) {
        alert('Worker said: ' + e.data);
     }, false);

     worker.postMessage($('#input').val());
}

$(function(){
    $('button').click(handleClick);
});
})(jQuery);
