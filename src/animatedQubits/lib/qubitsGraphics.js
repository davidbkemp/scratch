/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (d3, d3MeasureText) {
    
        var ensureDependenciesAreSet = function () {
            d3 = d3 || globals.d3;
            d3MeasureText = d3MeasureText || globals.d3MeasureText;
        };
    
        var qubitsGraphicsFromDomElement = function (svgElement) {
            ensureDependenciesAreSet();
            return qubitsGraphicsFromD3Element(d3.select(svgElement));
        };
    
        var qubitsGraphicsFromD3Element = function (d3Element) {
            d3MeasureText.d3 = d3MeasureText.d3 || d3;
            var textDim = d3MeasureText("M");
            
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
                addText: function (options) {
                    var cssClass = options['class'];
                    var x = options.x || 0;
                    var y = options.y || 0;
                    var text = options.text;
                    d3Element.append('text')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('class', cssClass)
                        .text(text);
                },
                addTextWithSubscript: function (text, subscript, x, y) {
                    var textElem = d3Element.append('g').append('text').attr('x', x);
                    textElem.append('tspan').text(text).attr('y', y);
                    textElem.append('tspan').text(subscript)
                        .attr('class', 'animatedTextSubscript')
                        .attr('y', y + textDim.height / 2);
                },
                createGroup: function (options) {
                    var cssClass = options['class'];
                    var x = options.x || 0;
                    var y = options.y || 0;
                    var transform = d3.svg.transform().translate([x, y]);
                    var element = d3Element.append('g')
                        .attr('class', cssClass)
                        .attr('transform', transform);
                    return(qubitsGraphicsFromD3Element(element));
                }
            };
        };
        return qubitsGraphicsFromDomElement;
    };
    
    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(["d3", "d3MeasureText"], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('d3'), require('d3MeasureText'));
    } else {
        globals.qubitsGraphics = createModule();
    }

    
})(this);