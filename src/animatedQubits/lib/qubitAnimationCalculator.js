/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (_, jsqubitsModule) {

       var jsqubits;

        var ensureDependenciesAreSet = function () {
            _ = _ || globals._;
            jsqubitsModule = jsqubitsModule || globals.jsqubits;
            jsqubits = jsqubitsModule.jsqubits;
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
            
            var createPhase2bState = function (phase2aState, newStateComponent, phase2bGroupedByState) {
                var phase2bState = _.clone(phase2aState),
                    numericIndex = newStateComponent.asNumber();
                phase2bState.amplitude = phase2aState.amplitude.multiply(newStateComponent.amplitude);
                phase2bState.bitString = newStateComponent.asBitString();
                phase2bState.numericIndex = numericIndex;
                var stateGroup = phase2bGroupedByState[numericIndex];
                if (!stateGroup) {
                    stateGroup = phase2bGroupedByState[numericIndex] = [];
                    phase2bState.x = maxRadius;
                    phase2bState.y = yOffSetForState(numericIndex);
                } else {
                    var prevState = _.last(stateGroup),
                        prevAmplitude = prevState.amplitude;
                    phase2bState.x = prevState.x + prevAmplitude.real() * config.maxRadius;
                    phase2bState.y = prevState.y - prevAmplitude.imaginary() * config.maxRadius;
                }
                stateGroup.push(phase2bState);
                return phase2bState;
            };

        /*
        function createPhase2bState(phase1State, context, newState) {
        var key = phase1State.key;
        var config = context.config;
        var keysGroupedByDestinationState = context.keysGroupedByDestinationState;
        var phase2aState = context.phase2aStates[key];
        var phase2bState = _.clone(phase2aState);
        phase2bState.amplitude = phase2aState.amplitude.multiply(newState.amplitude);
        var basisState = newState.index;
        phase2bState.index = basisState;
        var keyGroup = keysGroupedByDestinationState[basisState];
        if (!keyGroup) {
            keyGroup = [];
            keysGroupedByDestinationState[basisState] = keyGroup;
            phase2bState.x += 2 * config.maxRadius;
            phase2bState.y = computeAmplitudeYValue(config.maxRadius, basisState);
        } else {
            var prevState = context.phase2bStates[_.last(keyGroup)];
            var prevAmplitude = prevState.amplitude;
            phase2bState.x = prevState.x + prevAmplitude.real() * config.maxRadius;
            phase2bState.y = prevState.y - prevAmplitude.imaginary() * config.maxRadius;
        }
        keyGroup.push(key);
        return phase2bState;
    }
        */

            var createPhases1And2 = function (stateComponents, operation) {
                var phases = {
                    phase1: [],
                    phase2a: {},
                    phase2b: {},
                    phase1GroupedByState: []
                },
                phase2bGroupedByState = {};
                stateComponents.forEach(function(oldStateComponent) {
                    var qstate = operation(jsqubits(oldStateComponent.bitString));
                    var phase1StateGroup = [];
                    phases.phase1GroupedByState.push(phase1StateGroup);
                    var subSeq = 1;
                    qstate.each(function (newStateComponent) {
                        var phase1State = createPhase1State(oldStateComponent, subSeq++);
                        var phase2aState = createPhase2aState(oldStateComponent, phase1State);
                        var key = phase1State.key;
                        phases.phase1.push(phase1State);
                        phases.phase2a[key] = phase2aState;
                        phases.phase2b[key] = createPhase2bState(
                            phase2aState, newStateComponent, phase2bGroupedByState);
                        phase1StateGroup.push(phase1State);
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
        module.exports = createModule(require('lodash'), require('jsqubits'));
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.calculatorFactory = createModule();
    }

    
})(this);