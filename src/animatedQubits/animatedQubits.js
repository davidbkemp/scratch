/* global define:true, module, require, qubitsGraphics */
/* exported animatedQubits, define */

var animatedQubits;

(function () {
    "use strict";
    
    var createModule = function (qubitsGraphics) {
        return function () {
            var graphics;
            return {
                display: function (svgElement) {
                    graphics = qubitsGraphics(svgElement);
                    graphics.setHeight(42);
                }
            };
        };
    };

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define === 'function') {
        define(['qubitsGraphics'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('./lib/qubitsGraphics.js'));
    } else {
        animatedQubits = createModule(qubitsGraphics);
    }


})();