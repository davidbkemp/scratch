/* global define, module */

(function (globals) {
    "use strict";
    
    var createModule = function () {
    
        var calculatorFactory = function (config) {
        
            var maxRadius = config.maxRadius;
        
            var yOffSetForState = function (state) {
                // A single qubit state can have a radius of up to maxRadius,
                // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                return maxRadius * (state * Math.SQRT2 + 1);
            };

            return {
                yOffSetForState: yOffSetForState,
                
                augmentState: function (qstate) {
                    var keySequence = 0,
                        stateComponents = [];

                    qstate.each(function(stateComponent) {
                        stateComponent.key = 'k' + (++keySequence);
                        stateComponent.x = 0;
                        stateComponent.y = yOffSetForState(stateComponent.asNumber());
                        stateComponents.push(stateComponent);
                    });

                    stateComponents.sort(function (stateA, stateB) {
                        return stateA.asNumber() - stateB.asNumber();
                    });

                    return stateComponents;
                },
                
                createPhases: function () {
                    return {
                        phase1: []
                    };
                }
            };
        };
        return calculatorFactory;
    };
    
    /* Support AMD and CommonJS, with a fallback of using the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define([], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule();
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.calculatorFactory = createModule();
    }

    
})(this);