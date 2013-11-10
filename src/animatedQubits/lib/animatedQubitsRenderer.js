/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (qubitsGraphics) {
    
        var ensureDependenciesAreSet = function () {
            qubitsGraphics = qubitsGraphics || globals.qubitsGraphics;
        };
    
        var renderer = function (params) {
            ensureDependenciesAreSet();
            
            var graphics = qubitsGraphics(params.element),
                maxRadius = params.maxRadius,
                numBits = params.numBits,
                numStates = 1 << numBits,
                textHeight = graphics.getTextHeight(),
                textWidth = graphics.getTextWidth();
            
            var yOffSet = function (state) {
                // A single qubit state can have a radius of up to maxRadius,
                // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                return maxRadius * (state * Math.SQRT2 + 1);
            };

            var determineTotalHeight = function () {
                return yOffSet(numStates - 1) + maxRadius;
            };
            
            var determineTotalWidth = function () {
                return (1 + numBits) * textWidth + 6 *  maxRadius;
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

            return {
                updateDimensions: function () {
                    graphics.setHeight(determineTotalHeight());
                    graphics.setWidth(determineTotalWidth());
                },
                
                renderBitLabels: function () {
                    var y = 2 * textHeight / 3;
                    for (var i = 0; i < numBits; i++) {
                        var subscript = (numBits - i - 1).toString();
                        var x = i * textWidth;
                        graphics.addTextWithSubscript('q', subscript, x, y);
                    }
                },
                
                renderStateLabels: function () {
                    for (var state = 0; state < numStates; state++) {
                        renderStateBitLabels(state, graphics.createGroup({
                            'class': 'animatedQubitsStateLabel',
                            'y': yOffSet(state)
                        }));
                    }
                }
                
            };
        };
        return renderer;
    };
    
    /* Support AMD and CommonJS, with a fallback of using the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(["qubitsGraphics"], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('./qubitsGraphics'));
    } else {
        globals.animatedQubitsRenderer = createModule();
    }

    
})(this);