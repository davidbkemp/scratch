/*global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('../lib/jsqubits.js');

describe("animatedQubits", function () {

    var mockQubitsGraphicsModule,
        mockQubitsGraphics,
        config;
        
    beforeEach(function () {
        config = {
            maxRadius: 21
        };
        
        mockQubitsGraphics = {
            setHeight: function () {},
            setWidth: function () {},
            getTextHeight: function () {return 1;},
            getTextWidth: function () {return 1;}
        };
    
        mockQubitsGraphicsModule = function (element) {
            mockQubitsGraphicsModule.svgElement = element;
            return mockQubitsGraphics;
        };
    
        mockery.enable();
        mockery.registerAllowable('../animatedQubits');
        mockery.registerMock('./lib/qubitsGraphics.js', mockQubitsGraphicsModule);
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
        
        it("should set the height", function () {
            var element = "the svg element";
            spyOn(mockQubitsGraphics, 'setHeight');
               
            animation.display(element);
            
            expect(mockQubitsGraphicsModule.svgElement).toBe(element);
            expect(mockQubitsGraphics.setHeight)
                .toHaveBeenCalledWith(config.maxRadius * (2 + (numStates - 1) * Math.SQRT2));
        });

        it('should set the width', function () {
            var textWidth = 13;
            spyOn(mockQubitsGraphics, 'setWidth');
            spyOn(mockQubitsGraphics, 'getTextWidth').andReturn(textWidth);
    
            animation.display("the svg element");
            
            expect(mockQubitsGraphics.setWidth)
                .toHaveBeenCalledWith((1 + qstate.numBits()) * textWidth + 6 * config.maxRadius);

        });

    });

    
});
})();