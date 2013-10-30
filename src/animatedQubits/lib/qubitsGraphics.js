/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (d3, d3MeasureText) {
        return function (svgElement) {
            d3MeasureText.d3 = d3MeasureText.d3 || d3;
            var d3Element = d3.select(svgElement),
                textDim = d3MeasureText("M");
            
            return {
                getTextHeight: function () {
                    return textDim.height;
                },
                getTextWidth: function () {
                    return textDim.width * 1.5;
                },
                setHeight: function (height) {
                    d3Element.attr('height', height);
                },
                setWidth: function (width) {
                    d3Element.attr('width', width);
                },
                addTextWithSubscript: function (text, subscript, x, y) {
                    var textElem = d3Element.append('g').append('text').attr('x', x);
                    textElem.append('tspan').text(text).attr('y', y);
                    textElem.append('tspan').text(subscript)
                        .attr('class', 'animatedTextSubscript')
                        .attr('y', y + textDim.height / 2);
                }
            };
        };
    };
    
    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(["d3", "d3MeasureText"], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('d3'), require('d3MeasureText'));
    } else {
        globals.qubitsGraphics = createModule(globals.d3, globals.d3MeasureText);
    }

    
})(this);