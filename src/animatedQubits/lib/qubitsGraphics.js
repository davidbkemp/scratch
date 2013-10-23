/* global define, module */

(function (globals) {
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
    if (typeof define !== 'undefined' && define.amd) {
        define(createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule();
    } else {
        globals.qubitsGraphics = createModule();
    }

    
})(this);