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
            
            var determineTotalHeight = function () {
                // A single qubit state can have a radius of up to maxRadius,
                // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                return config.maxRadius * (2 + Math.SQRT2 * (numStates - 1));
            };
            
            var determineTotalWidth = function () {
                return (1 + numBits) * textWidth + 6 *  config.maxRadius;
            };
            
            var renderBitLabels = function () {
                var y = 2 * textHeight / 3;
                for (var i = 0; i < numBits; i++) {
                    var subscript = (numBits - i - 1).toString();
                    var x = i * textWidth;
                    graphics.addTextWithSubscript('q', subscript, x, y);
                }
            };
            
            var asBitString = function (state) {
                return ('0000000000000000' + state.toString(2)).slice(-numBits);
            };
            
            var renderStateBitLabels = function (state, graphicsGroup) {
                var bitString = asBitString(state);
                for(var bitPos = 0; bitPos < numBits; bitPos++) {
                    graphicsGroup.addText({
                        'class': 'animatedQubitsStateBitLabel',
                        'x': bitPos * textWidth,
                        'text': bitString.charAt(bitPos)
                    });
                }
            };
            
            var renderStateLabels = function () {
                for (var state = 0; state < numStates; state++) {
                    renderStateBitLabels(state, graphics.createGroup({
                        'class': 'animatedQubitsStateLabel',
                        'y': config.maxRadius * (state * Math.SQRT2 + 1)
                    }));
                }
            };
            
            return {
                display: function (svgElement) {
                    graphics = qubitsGraphics(svgElement);
                    textHeight = graphics.getTextHeight();
                    textWidth = graphics.getTextWidth();
                    graphics.setHeight(determineTotalHeight());
                    graphics.setWidth(determineTotalWidth());
                    renderBitLabels();
                    renderStateLabels();
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