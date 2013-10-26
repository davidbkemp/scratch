/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (qubitsGraphics) {
        return function (qstate, config) {
            var graphics,
                numBits = qstate.numBits();
            return {
                display: function (svgElement) {
                    graphics = qubitsGraphics(svgElement);
                    // A single qubit state can have a radius of up to maxRadius,
                    // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                    graphics.setHeight(config.maxRadius * (2 + Math.SQRT2 * (numBits - 1)));
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