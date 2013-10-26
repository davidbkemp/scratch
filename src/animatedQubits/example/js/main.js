/* global requirejs, document */

(function () {
"use strict";

var bowerComps = '../bower_components/';
var animatedQubitsPath = '../../';

requirejs.config({
    baseUrl: 'js',
    paths: {
        animatedQubits: animatedQubitsPath + 'animatedQubits',
        qubitsGraphics: animatedQubitsPath + 'lib/qubitsGraphics',
        jsqubits: bowerComps + 'animatedQubits/lib/jsqubits',
        d3MeasureText: bowerComps + 'd3-measure-text/lib/d3-measure-text'
    }
});

requirejs(['animatedQubits', 'jsqubits'],
    function (animatedQubits, jsqubits) {
        var animation = animatedQubits(jsqubits("10"), {maxRadius: 50});
        animation.display(document.getElementById("svg"));
    }
);

})();

