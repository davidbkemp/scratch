(function($) {

function handleClick() {
    alert($('#input').val());

    var worker = new Worker('src/wwworker.js');

    alert('created new worker')
    worker.addEventListener('message', function(e) {
        alert('Worker said: ' + e.data);
     }, false);

     alert('added listener')

     worker.postMessage($('#input').val());
     alert('posted message')
}

$(function(){
    $('button').click(handleClick);
});
})(jQuery);
