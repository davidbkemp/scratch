/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (_, jsqubits) {

        var ensureDependenciesAreSet = function () {
            _ = _ || globals._;
            jsqubits = jsqubits || globals.jsqubits;
        };

        var calculatorFactory = function (config) {
            ensureDependenciesAreSet();
            var maxRadius = config.maxRadius;
        
            var yOffSetForState = function (state) {
                // A single qubit state can have a radius of up to maxRadius,
                // but two (valid) qubit states will be closest when each has a radius of 1/sqrt(2).
                return maxRadius * (state * Math.SQRT2 + 1);
            };
            
            var createPhase1State = function (stateComponent, subSeq) {
                var phase1State = _.clone(stateComponent);
                phase1State.key = stateComponent.key + '-' + subSeq;
                if (subSeq > 1) {
                    phase1State.amplitude = jsqubits.ZERO;
                }
                return phase1State;
            };

            var createPhase2aState = function (oldStateComponent, phase1State) {
                var phase2aState = _.clone(phase1State);
                phase2aState.amplitude = oldStateComponent.amplitude;
                return phase2aState;
            };

            var createPhases1And2 = function (stateComponents, operation) {
                var phases = {
                    statesGroupedByOriginalState: [],
                    phase1: [],
                    phase2a: {},
                    phase2b: {}
                };
                stateComponents.forEach(function(oldStateComponent) {
                    var qstate = operation(jsqubits(oldStateComponent.bitString));
                    var stateGroup = [];
                    phases.statesGroupedByOriginalState.push(stateGroup);
                    var subSeq = 1;
                    qstate.each(function () {
                        var phase1State = createPhase1State(oldStateComponent, subSeq++);
                        var phase2aState = createPhase2aState(oldStateComponent, phase1State);
                        var key = phase1State.key;
                        phases.phase1.push(phase1State);
                        phases.phase2a[key] = phase2aState;
                        stateGroup.push(phase1State);
                    });
                });
                return phases;
            };
            
            /*
            forEach(function(amplitudeWithState) {
            var qstate = op(jsqubits(asBinary(amplitudeWithState.index, context.expandedState.numBits)));
            statesGroup = [];
            context.statesGroupedByOriginalState.push(statesGroup);
            var subSeq = 1;
            qstate.each(function (newState) {
                var phase1State = createPhase1State(amplitudeWithState, subSeq++);
                var key = phase1State.key;
                var phase2aState = createPhase2aState(amplitudeWithState, phase1State);
                context.phase2aStates[key] = phase2aState;
                context.phase2bStates[key] = createPhase2bState(phase1State, context, newState);
                context.phase1States.push(phase1State);
                statesGroup.push(phase1State);
            });
        });
    }
            */

            return {
                yOffSetForState: yOffSetForState,
                
                augmentState: function (qstate) {
                    var keySequence = 0,
                        stateComponents = [];

                    qstate.each(function(stateComponent) {
                        var augmentedStateComponent = {
                            bitString: stateComponent.asBitString(),
                            numericIndex: stateComponent.asNumber(),
                            amplitude: stateComponent.amplitude,
                            key: 'k' + (++keySequence),
                            x: 0,
                            y: yOffSetForState(stateComponent.asNumber())
                        };
                        stateComponents.push(augmentedStateComponent);
                    });

                    stateComponents.sort(function (stateA, stateB) {
                        return stateA.numericIndex - stateB.numericIndex;
                    });

                    return stateComponents;
                },
                
                createPhases: function (stateComponents, operation) {
                    var phases1And2 = createPhases1And2(stateComponents, operation);
                    return {
                        phase1: phases1And2.phase1,
                        phase2a: phases1And2.phase2a,
                        phase2b: phases1And2.phase2b
                    };
                }
            };
        };
        return calculatorFactory;
    };
    
    /* Support AMD and CommonJS, with a fallback of using the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['lodash', 'jsqubits'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('lodash'), require('./jsqubits'));
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.calculatorFactory = createModule();
    }

    
})(this);