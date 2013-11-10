/*global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('../lib/jsqubits');

describe("animatedQubits using npm/commonjs dependencies", function () {
    it("should load without error", function () {
        var animatedQubits = require('../animatedQubits');
        expect(animatedQubits).not.toBeFalsy();
    });
});

describe("animatedQubits", function () {

    var mockRendererModule,
        mockRenderer,
        config;
        
    beforeEach(function () {
        config = {
            maxRadius: 21
        };
        
        mockRenderer = {
            updateDimensions: function () {},
            renderBitLabels: function () {},
            renderStateLabels: function () {}
        };
        
        mockRendererModule = function (params) {
            mockRendererModule.params = params;
            return mockRenderer;
        };
    
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../animatedQubits');
        mockery.registerMock('./lib/animatedQubitsRenderer', mockRendererModule);
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
        
        it("should pass the require params", function () {
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

    });

});

})();