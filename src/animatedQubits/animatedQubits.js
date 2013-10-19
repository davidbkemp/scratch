/* global define:true, module, require, qubitsGraphics */
/* exported animatedQubits, define */

var animatedQubits;

(function () {
    "use strict";

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'function') {
        define = function (ignoredList, f) {
            if (typeof module !== 'undefined' && module.exports) {
                module.exports = f(require('./lib/qubitsGraphics.js'));
            } else {
                animatedQubits = f(qubitsGraphics);
            }
        };
    }

    define(['qubitsGraphics'], function (qubitsGraphics) {
        return function () {
        
            var graphics;
            
            return {
                display: function (svgElement) {
                    graphics = qubitsGraphics(svgElement);
                    graphics.setHeight(42);
                }
            };
        };
    });
    
})();