/* global requirejs */

(function () {
"use strict";
requirejs.config({
    baseUrl: 'js',
    paths: {
        animatedQubits: '../bower_components/animatedQubits/animatedQubits',
        qubitsGraphics: '../bower_components/animatedQubits/lib/qubitsGraphics'
    }
});

requirejs(['animatedQubits'],
    function (animatedQubits) {
        animatedQubits('ohoh');
    }
);

})();

