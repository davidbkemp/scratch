/* global define:true, module */
/* exported qubitsGraphics */

var qubitsGraphics;

(function () {
    "use strict";
    
    var createModule = function () {
        return function () {
            return {
                setHeight: function () {
                    
                }
            };
        };
    };
    
    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define === 'function') {
        define(createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule();
    } else {
        qubitsGraphics = createModule();
    }

    
})();