/* global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery');

describe("animatedQubitsRenderer using npm/commonjs dependencies", function () {
    it('should should load without error', function () {
        expect(require('../lib/animatedQubitsRenderer')).not.toBeFalsy();
    });
});

describe("animatedQubitsRenderer", function () {

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
        mockery.registerAllowable('../lib/animatedQubitsRenderer');
        mockery.registerMock('./qubitsGraphics', mockQubitsGraphicsModule);
    });
    
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    
    it("should pass the svgElement to qubitsGraphics", function name() {
        require('../lib/animatedQubitsRenderer')(params);
        expect(mockQubitsGraphicsModule.svgElement).toBe(params.element);
    });
        
    describe('#updateDimensions', function () {
        var renderer,
            numStates;
            
        beforeEach(function () {
            numStates = 1 << params.numBits;
            renderer = require('../lib/animatedQubitsRenderer')(params);
        });
        
        it("should set the height", function () {
            spyOn(mockQubitsGraphics, 'setHeight');
               
            renderer.updateDimensions();
            
            expect(mockQubitsGraphics.setHeight)
                .toHaveBeenCalledWith(params.maxRadius * (2 + (numStates - 1) * Math.SQRT2));
        });


        it('should set the width', function () {
            spyOn(mockQubitsGraphics, 'setWidth');
            
            renderer.updateDimensions();
            
            expect(mockQubitsGraphics.setWidth)
                .toHaveBeenCalledWith((1 + params.numBits) * textWidth + 6 * params.maxRadius);

        });
    });
    
    describe('#renderBitLabels', function () {
        var renderer;
            
        beforeEach(function () {
            renderer = require('../lib/animatedQubitsRenderer')(params);
        });

        it('should create bit labels', function () {
            spyOn(mockQubitsGraphics, 'addTextWithSubscript');
            
            renderer.renderBitLabels();
            
            var expectedY = 2 * textHeight / 3;
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '2', 0, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '1', textWidth, expectedY);
            expect(mockQubitsGraphics.addTextWithSubscript)
                .toHaveBeenCalledWith('q', '0', textWidth * 2, expectedY);
        });
    });

    describe("#renderStateLabels", function () {
        var renderer;
            
        beforeEach(function () {
            params.numBits = 2;
            renderer = require('../lib/animatedQubitsRenderer')(params);
        });

        it('should create state labels', function () {
        
            spyOn(mockQubitsGraphics, 'createGroup').andReturn(mockGraphicsGroup);
            spyOn(mockGraphicsGroup, 'addText');
            
            renderer.renderStateLabels();
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel', 'y': params.maxRadius
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '0'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '0'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': params.maxRadius * (Math.SQRT2 + 1)
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '0'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '1'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': params.maxRadius * (2 * Math.SQRT2 + 1)
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '1'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '0'
            });
            
            expect(mockQubitsGraphics.createGroup).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateLabel',
                'y': params.maxRadius * (3 * Math.SQRT2 + 1)
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': 0, 'text': '1'
            });
            expect(mockGraphicsGroup.addText).toHaveBeenCalledWith({
                'class': 'animatedQubitsStateBitLabel', 'x': textWidth, 'text': '1'
            });
            
        });
   
    });

});

})();
