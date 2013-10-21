/*global require, describe, it, expect, beforeEach, afterEach */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('jsqubits');

describe("animatedQubits", function () {

    var animation,
        mockQubitsGraphicsModule,
        mockQubitsGraphics,
        qstate,
        config;
        
    beforeEach(function () {
        qstate = jsqubits('|10>');
        
        config = {
            maxRadius: 21;
        };
        
        mockQubitsGraphics = {
                setHeight: function () {}
        };
    
        mockQubitsGraphicsModule = function (element) {
            mockQubitsGraphicsModule.svgElement = element;
            return mockQubitsGraphics;
        };
    
        mockery.enable();
        mockery.registerMock('./lib/qubitsGraphics.js', mockQubitsGraphicsModule);
        animation = require('../animatedQubits')(config, qstate);
    });
    
    afterEach(function () {
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
            expect(mockQubitsGraphics).toHaveBeenCalledWith(55);
            // svg.attr('height', '' + (config.maxRadius * (1 + (2 << numBits))) + 'px');
        });
    });
});

})();