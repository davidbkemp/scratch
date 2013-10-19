/* global module */
/* exported animatedQubits */

var define, animatedQubits;

(function () {
    "use strict";

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'function') {
        define = function (f) {
            if (typeof module !== 'undefined' && module.exports) {
                module.exports = f();
            } else {
                animatedQubits = f();
            }
        };
    }
    
    
    define(function () {
        return function () {
            return {
                display: function () {
                    
                }
            };
        };
    });
    
})();