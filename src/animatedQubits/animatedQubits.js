/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (qubitsGraphics) {
        return function (qstate, config) {
            var graphics,
                textHeight,
                textWidth,
                numBits = qstate.numBits(),
                numStates = 1 << numBits;
            
            function determineTotalHeight() {
                // A single qubit state can have a radius of up to maxRadius,
                // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                return config.maxRadius * (2 + Math.SQRT2 * (numStates - 1));
            }
            
            function determineTotalWidth() {
                return (1 + numBits) * textWidth + 6 *  config.maxRadius;
            }
            
            return {
                display: function (svgElement) {
                    graphics = qubitsGraphics(svgElement);
                    textHeight = graphics.getTextHeight();
                    textWidth = graphics.getTextWidth();
                    graphics.setHeight(determineTotalHeight());
                    graphics.setWidth(determineTotalWidth());
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