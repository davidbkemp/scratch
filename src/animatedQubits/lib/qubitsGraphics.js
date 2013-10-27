/* global define, module, d3, d3MeasureText */

(function (globals) {
    "use strict";
    
    var createModule = function () {
        return function (svgElement) {
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
                }
            };
        };
    };
    
    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule();
    } else {
        globals.qubitsGraphics = createModule();
    }

    
})(this);