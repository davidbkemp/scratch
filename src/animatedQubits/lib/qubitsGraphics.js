/* global define, module, d3 */

(function (globals) {
    "use strict";
    
    var createModule = function () {
        return function (svgElement) {
            return {
                setHeight: function (height) {
                    d3.select(svgElement).attr('height', height);
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