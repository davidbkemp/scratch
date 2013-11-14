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
            expect(augmentedState[0].asBitString()).toBe('00');
            expect(augmentedState[0].key).toBeDefined();
            expect(augmentedState[1].asBitString()).toBe('10');
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
});


})();
