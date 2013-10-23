/* global define, module, require */

(function (globals) {
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
    if (typeof define !== 'undefined' && define.amd) {
        define(['qubitsGraphics'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('./lib/qubitsGraphics.js'));
    } else {
        globals.animatedQubits = createModule(globals.qubitsGraphics);
    }


})(this);