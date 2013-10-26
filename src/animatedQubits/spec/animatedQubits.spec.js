/*global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('../lib/jsqubits.js');

describe("animatedQubits", function () {

    var animation,
        mockQubitsGraphicsModule,
        mockQubitsGraphics,
        qstate,
        config;
        
    beforeEach(function () {
        qstate = jsqubits('|10>');
        
        config = {
            maxRadius: 21
        };
        
        mockQubitsGraphics = {
                setHeight: function () {}
        };
    
        mockQubitsGraphicsModule = function (element) {
            mockQubitsGraphicsModule.svgElement = element;
            return mockQubitsGraphics;
        };
    
        mockery.enable();
        mockery.registerAllowable('../animatedQubits');
        mockery.registerMock('./lib/qubitsGraphics.js', mockQubitsGraphicsModule);
        animation = require('../animatedQubits')(qstate, config);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("should return an object with a display() method", function () {
        expect(typeof animation.display).toBe("function");
    });
    
    describe("#display", function () {
    
        it("should adjust the height of the svg element", function () {
            var element = "the svg element";
            spyOn(mockQubitsGraphics, 'setHeight');
    
            animation.display(element);
            
            expect(mockQubitsGraphicsModule.svgElement).toBe(element);
            expect(mockQubitsGraphics.setHeight)
                .toHaveBeenCalledWith(config.maxRadius * (2 + Math.SQRT2));
            // svg.attr('height', '' + (config.maxRadius * (1 + (2 << numBits))) + 'px');
        });
    });
});

})();