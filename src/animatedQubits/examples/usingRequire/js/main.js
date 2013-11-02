/* global requirejs, document */

(function () {
"use strict";

var animatedQubitsPath = '../../',
    bowerPath = 'app/bower_components/';

requirejs.config({
    baseUrl: '.',
    paths: {
        animatedQubits: animatedQubitsPath + 'animatedQubits',
        qubitsGraphics: animatedQubitsPath + 'lib/qubitsGraphics',
        jsqubits: animatedQubitsPath + 'lib/jsqubits',
        d3MeasureText: bowerPath + 'd3-measure-text/lib/d3-measure-text',
        d3: bowerPath + 'd3/d3.min'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});


requirejs(['animatedQubits', 'jsqubits'],
    function (animatedQubits, jsqubits) {
        var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
        animation.display(document.getElementById("svg"));
    }
);

})();

