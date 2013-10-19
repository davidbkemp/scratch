/* global define:true, module */
/* exported qubitsGraphics */

var qubitsGraphics;

(function () {
    "use strict";

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'function') {
        define = function (ignoredList, f) {
            if (typeof module !== 'undefined' && module.exports) {
                module.exports = f();
            } else {
                qubitsGraphics = f();
            }
        };
    }
    
    
    define([], function () {
        return function () {
            return {
                setHeight: function () {
                    
                }
            };
        };
    });
    
})();