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

            var createPhases1And2 = function (stateComponents, operation) {
                var phases = {
                    phase1: [],
                    phase2a: {},
                    phase2b: {},
                    stateComponentIndexesGroupedBySource: []
                },
                phase2bGroupedByState = {};
                stateComponents.forEach(function(oldStateComponent) {
                    var qstate = operation(jsqubits(oldStateComponent.bitString));
                    var phase1StateGroupIndexes = [];
                    phases.stateComponentIndexesGroupedBySource.push(phase1StateGroupIndexes);
                    var subSeq = 1;
                    qstate.each(function (newStateComponent) {
                        var phase1State = createPhase1State(oldStateComponent, subSeq++);
                        var phase2aState = createPhase2aState(oldStateComponent, phase1State);
                        var key = phase1State.key;
                        phase1StateGroupIndexes.push(phases.phase1.length);
                        phases.phase1.push(phase1State);
                        phases.phase2a[key] = phase2aState;
                        phases.phase2b[key] = createPhase2bState(
                            phase2aState, newStateComponent, phase2bGroupedByState);
                    });
                });
                return phases;
            };

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
                    return createPhases1And2(stateComponents, operation);
                }
            };
        };
        return calculatorFactory;
    };
    
    /* Support AMD and CommonJS, with a fallback of using the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['lodash', 'jsqubits'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('lodash'), require('jsqubits').jsqubits);
    } else {
        globals.animatedQubitsInternal = globals.animatedQubitsInternal || {};
        globals.animatedQubitsInternal.calculatorFactory = createModule();
    }

    
})(this);