/* global requirejs */

(function () {
"use strict";
requirejs.config({
    baseUrl: 'js',
    paths: {
        animatedQubits: '../../animatedQubits',
        qubitsGraphics: '../../lib/qubitsGraphics'
    }
});

requirejs(['animatedQubits'],
    function (animatedQubits) {
        animatedQubits('ohoh');
        alert("made it")
    }
);

})();

