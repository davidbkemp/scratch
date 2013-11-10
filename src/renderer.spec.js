/* global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery');

describe("renderer using npm/commonjs dependencies", function () {
    it('should should load without error', function () {
        expect(require('../lib/renderer')).not.toBeFalsy();
    });
});

describe("renderer", function () {

    var mockQubitsGraphicsModule,
        mockQubitsGraphics,
        mockGraphicsGroup,
        params,
        textHeight = 13,
        textWidth = 17;
        
    beforeEach(function () {
        params = {
            element: "the svg element",
            maxRadius: 21,
            numBits: 3
        };
        
        mockQubitsGraphics = {
            setHeight: function () {},
            setWidth: function () {},
            getTextHeight: function () {return textHeight;},
            getTextWidth: function () {return textWidth;},
            addTextWithSubscript: function () {},
            createGroup: function () {return mockGraphicsGroup;}
        };
        
        mockGraphicsGroup = {
            addText: function () {}
        };
    
        mockQubitsGraphicsModule = function (element) {
            mockQubitsGraphicsModule.svgElement = element;
            return mockQubitsGraphics;
        };
    
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../lib/renderer');
        mockery.registerMock('./lib/qubitsGraphics', mockQubitsGraphicsModule);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    
        
    describe('#updateDimensions', function () {
        var renderer,
            numStates;
            
        beforeEach(function () {
            numStates = 1 << params.numBits;
            renderer = require('../lib/renderer')(params);
        });
        
        it("should set the height", function () {
            spyOn(mockQubitsGraphics, 'setHeight');
               
            renderer.updateDimensions();
            
            expect(mockQubitsGraphicsModule.svgElement).toBe(params.element);
            expect(mockQubitsGraphics.setHeight)
                .toHaveBeenCalledWith(params.maxRadius * (2 + (numStates - 1) * Math.SQRT2));
        });

/*
        it('should set the width', function () {
            spyOn(mockQubitsGraphics, 'setWidth');
            
            animation.display("the svg element");
            
            expect(mockQubitsGraphics.setWidth)
                .toHaveBeenCalledWith((1 + qstate.numBits()) * textWidth + 6 * config.maxRadius);

        });
        
        it('should create bit labels', function () {
            spyOn(mockQubitsGraphics, 'addTextWithSubscript');
            
            animation.display("the svg element");
            
            var expectedY = 2 * textHeight / 3;
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '2', 0, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '1', textWidth, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '0', textWidth * 2, expectedY);
        });

        it('should create state labels', function () {
        
            spyOn(mockQubitsGraphics, 'createGroup').andReturn(mockGraphicsGroup);
            spyOn(mockGraphicsGroup, 'addText');
            
            animation.display("the svg element");
            
            for (var basisState = 0; basisState < 8; basisState++) {
                expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                    'class': 'animatedQubitsStateLabel',
                    'y': config.maxRadius * (basisState * Math.SQRT2 + 1)
                });
                var label = ('00' + basisState.toString(2)).slice(-3);
                for (var bitPos = 0; bitPos < 3; bitPos++) {
                    expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                        'class': 'animatedQubitsStateBitLabel',
                        'x': bitPos * textWidth,
                        'text': label.charAt(bitPos)
                    });
                }
            }
            
        });
*/
    });

});

})();
