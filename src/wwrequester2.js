(function($) {

function handleClick() {
    alert($('#input').value);

    var worker = new Worker('wwworker.js');

    worker.addEventListener('message', function(e) {
        alert('Worker said: ' + e.data);
     }, false);

     worker.postMessage($('#input').value);
}

$(function(){
    $('button').click(handleClick);
});
})(jQuery);
