/* global requirejs, document */

(function () {
"use strict";

var animatedQubitsPath = '../',
    bowerPath = 'app/bower_compnonets/';

requirejs.config({
    baseUrl: '.',
    paths: {
        animatedQubits: animatedQubitsPath + 'animatedQubits',
        qubitsGraphics: animatedQubitsPath + 'lib/qubitsGraphics',
        jsqubits: animatedQubitsPath + 'lib/jsqubits',
        d3MeasureText: bowerPath + 'd3-measure-text/lib/d3-measure-text'
    }
});

requirejs(['animatedQubits', 'jsqubits'],
    function (animatedQubits, jsqubits) {
        var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
        animation.display(document.getElementById("svg"));
    }
);

})();

