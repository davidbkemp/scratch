/* global require, describe, it, expect, beforeEach */

(function () {
"use strict";

var jsqubits = require('../lib/jsqubits');

describe("qubitAnimationRenderer", function () {
    var config, calculator;

    beforeEach(function () {
        config = {maxRadius: 64};
        calculator = require('../lib/qubitAnimationCalculator')(config);
    });
    
    describe("yOffSetForState", function () {
        it("should return maxRadius for 0", function () {
            expect(calculator.yOffSetForState(0)).toBe(64);
        });
        it("should return maxRadius * (1 + state*Math.SQRT_2)", function () {
            expect(calculator.yOffSetForState(7)).toBe(config.maxRadius * (1 + 7 * Math.SQRT2));
        });
    });

    describe("#augmentState", function () {
    
        var augmentedState;
    
        beforeEach(function () {
            var qstate = jsqubits('|10>').hadamard(1);
            augmentedState = calculator.augmentState(qstate);
        });
    
        it("should add keys to each state", function () {
            expect(augmentedState.length).toBe(2);
            expect(augmentedState[0].bitString).toBe('00');
            expect(augmentedState[0].key).toBeDefined();
            expect(augmentedState[1].bitString).toBe('10');
            expect(augmentedState[1].key).toBeDefined();
            expect(augmentedState[1].key).not.toEqual(augmentedState[0].key);
        });
        
        it("should set x and y offsets", function () {
            expect(augmentedState[0].x).toBe(0);
            expect(augmentedState[1].x).toBe(0);
            expect(augmentedState[0].y).toBe(config.maxRadius);
            expect(augmentedState[1].y).toBe(config.maxRadius * (1 + 2 * Math.SQRT2));
        });
    });
    
    describe("#createPhases", function () {
        var qstate, phases;
    
        beforeEach(function () {
            qstate = jsqubits('|10>').hadamard(0);
            var operation = function hadamard1(state) { return state.hadamard(1); };
            var stateComponents = calculator.augmentState(qstate);
            phases = calculator.createPhases(stateComponents, operation);
        });
    
        it("phase1: should replicate initial state components for each resultant component", function () {
            var phase1 = phases.phase1;
            
            expect(phase1.length).toBe(4);
            
            expect(phase1[0].bitString).toBe("10");
            expect(phase1[1].bitString).toBe("10");
            expect(phase1[2].bitString).toBe("11");
            expect(phase1[3].bitString).toBe("11");
            
            expect(phase1[0].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(2).format({toString: 2}));
            expect(phase1[1].amplitude.format({toString: 2})).toEqual('0');
            expect(phase1[2].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(3).format({toString: 2}));
            expect(phase1[3].amplitude.format({toString: 2})).toEqual('0');
            
            expect(phase1[0].key).toBe("k1-1");
            expect(phase1[1].key).toBe("k1-2");
            expect(phase1[2].key).toBe("k2-1");
            expect(phase1[3].key).toBe("k2-2");
        });
        
        it("phase2a: should set amplitudes back to their origina values", function () {
            var phase2a = phases.phase2a;
            
            expect(Object.keys(phase2a).length).toBe(4);
            
            expect(phase2a['k1-1'].bitString).toBe("10");
            expect(phase2a['k1-2'].bitString).toBe("10");
            expect(phase2a['k2-1'].bitString).toBe("11");
            expect(phase2a['k2-2'].bitString).toBe("11");
            
            expect(phase2a['k1-1'].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(2).format({toString: 2}));
            expect(phase2a['k1-2'].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(2).format({toString: 2}));
            expect(phase2a['k2-1'].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(3).format({toString: 2}));
            expect(phase2a['k2-2'].amplitude.format({toString: 2}))
                .toEqual(qstate.amplitude(3).format({toString: 2}));
        });
    });
});


})();
