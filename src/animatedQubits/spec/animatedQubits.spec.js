/*global require, describe, it, expect, beforeEach, afterEach, spyOn, jasmine */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('jsqubits').jsqubits;

var createMockPromise = function () {
    return {
        when: function (f) {
            if (f) f();
            return createMockPromise();
        },
        then: function (f) {
            if (f) f();
            return createMockPromise();
        }
    };
};

describe("animatedQubits using npm/commonjs dependencies", function () {
    it("should load without error", function () {
        var animatedQubits = require('../animatedQubits');
        expect(animatedQubits).not.toBeFalsy();
    });
});

describe("animatedQubits", function () {

    var mockRendererModule,
        mockRenderer,
        mockCalculatorModule,
        mockCalculator,
        mockQ,
        mockInitialPromise,
        config;
        
    beforeEach(function () {
        config = {
            maxRadius: 21
        };
        
        mockRenderer = {
            updateDimensions: function () {},
            renderBitLabels: function () {},
            renderStateLabels: function () {},
            renderState: function () {}
        };
        
        mockRendererModule = function (params) {
            mockRendererModule.params = params;
            return mockRenderer;
        };
        
        mockCalculator = {
            augmentState: function () { return []; },
            createPhases: function () { return {}; }
        };
        
        mockCalculatorModule = function () {
            return mockCalculator;
        };

        mockInitialPromise = createMockPromise();

        mockQ = {
            when: function () {}
        };

        spyOn(mockQ, 'when').andReturn(mockInitialPromise);

        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../animatedQubits');
        mockery.registerMock('./lib/animatedQubitsRenderer', mockRendererModule);
        mockery.registerMock('./lib/qubitAnimationCalculator', mockCalculatorModule);
        mockery.registerMock('q', mockQ);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    it("should return an object with a display() method", function () {
        var qstate = jsqubits('|110>'),
            animation = require('../animatedQubits')(qstate, config);
        
        expect(typeof animation.display).toBe("function");
    });

    describe('#display', function () {
        var qstate,
            numStates,
            animation;
            
        beforeEach(function () {
            qstate = jsqubits('|101>');
            numStates = 1 << qstate.numBits();
            animation = require('../animatedQubits')(qstate, config);
        });
        
        it("should pass the required params to the renderer", function () {
            animation.display("the svg element");
            
            expect(mockRendererModule.params).toEqual({
                element: "the svg element",
                numBits: 3,
                maxRadius: config.maxRadius
            });
        });
        
        it("should render the labels", function () {
            spyOn(mockRenderer, 'updateDimensions');
            spyOn(mockRenderer, 'renderBitLabels');
            spyOn(mockRenderer, 'renderStateLabels');
               
            animation.display("the svg element");

            expect(mockRenderer.updateDimensions).toHaveBeenCalled();
            expect(mockRenderer.renderBitLabels).toHaveBeenCalled();
            expect(mockRenderer.renderStateLabels).toHaveBeenCalled();
        });

        it("should augment the state", function () {
            spyOn(mockCalculator, 'augmentState');
        
            animation.display("the svg element");
            
            expect(mockCalculator.augmentState).toHaveBeenCalledWith(qstate);
        });
        
        it("should render the augmented state", function () {
            spyOn(mockCalculator, 'augmentState').andReturn("augmented state");
            spyOn(mockRenderer, 'renderState');
            
            animation.display("the svg element");
            
            expect(mockRenderer.renderState).toHaveBeenCalledWith("augmented state");
        });

    });
    
    describe("#applyOperation", function () {
    
        var animation,
            qstate,
            operation,
            operationReturnState,
            operationCalls,
            options = {someOption: 42};
            
            
        beforeEach(function () {
            qstate = jsqubits('|101>').hadamard(0);
            animation = require('../animatedQubits')(qstate, config);
            animation.display('svg element');

            spyOn(mockRenderer, 'renderState');
            spyOn(mockCalculator, 'createPhases').andReturn({
                phase1: 'phase1',
                phase2a: 'phase2a',
                phase2b: 'phase2b',
                phase3: 'phase3',
                phase4: 'phase4',
                phase5: 'phase5'
            });
            operationCalls = [];
            operationReturnState = qstate.T(0);
            operation = function op(state) {
                operationCalls.push(state);
                return operationReturnState;
            };
        });
    
        it("should wait for any exisiting operation to complete", function () {
            var nextPromise = createMockPromise();
            spyOn(mockInitialPromise, 'then').andReturn(nextPromise);
            
            var returnValue = animation.applyOperation(operation, options);
            
            expect(mockQ.when).toHaveBeenCalledWith();
            expect(mockInitialPromise.then).toHaveBeenCalled();
            expect(returnValue).toBe(nextPromise);
        });
        
        it("should create phases", function () {
           animation.applyOperation(operation, options);
            expect(mockCalculator.createPhases)
                .toHaveBeenCalledWith(jasmine.any(Array), operation);
        });
        
        it("should render phase1", function () {
            animation.applyOperation(operation, options);
            expect(mockRenderer.renderState).toHaveBeenCalledWith("phase1");
        });
        
        it("should apply the operation to qstate and its components", function () {
            animation.applyOperation(operation, options);
            expect(operationCalls.length).toBe(1);
            expect(operationCalls[0]).toBe(qstate);
        });
        
        it("should augment the new state", function () {
            spyOn(mockCalculator, 'augmentState');
            animation.applyOperation(operation, options);
            expect(mockCalculator.augmentState).toHaveBeenCalledWith(operationReturnState);
        });
        
        describe("when applied for a second time", function () {
            it("should create phases based on the new state", function () {
                spyOn(mockCalculator, 'augmentState').andReturn(["newAugmentedState"]);
                animation.applyOperation(operation, options);
                animation.applyOperation(operation, options);
                expect(mockCalculator.createPhases.calls.length).toBe(2);
                expect(mockCalculator.createPhases.calls[1].args[0]).toEqual(["newAugmentedState"]);
            });
        });
    });

});

})();