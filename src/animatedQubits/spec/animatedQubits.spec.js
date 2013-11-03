/*global require, describe, it, expect, beforeEach, afterEach, spyOn */

(function () {
"use strict";

var mockery = require('mockery'),
    jsqubits = require('../lib/jsqubits.js');

describe("animatedQubits", function () {

    var mockQubitsGraphicsModule,
        mockQubitsGraphics,
        mockGraphicsGroup,
        config,
        textHeight = 13,
        textWidth = 17;
        
    beforeEach(function () {
        config = {
            maxRadius: 21
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
            
        
            /*
            var paddedString = "00000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
            
            function renderStateLabels(numBits, config) {
        var numStates = 1 << numBits;
        for (var basisState = 0; basisState < numStates; basisState++) {
            var labelElement = qstateBody.append('g')
                .attr('class', 'qstate')
                .attr('transform', computeStateLabelTransform(basisState, config.maxRadius, config.textHeight));
            var label = asBinary(basisState, numBits);
            for (var bitPos = 0; bitPos < label.length; bitPos++) {
                labelElement.append('text')
                    .attr('class', 'qstateBit')
                    .attr('x', bitPos * config.textWidth)
                    .text(label.charAt(bitPos));
            }
        }
    }
            */
        });

    });

    
});
})();