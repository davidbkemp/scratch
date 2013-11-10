/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (animatedQubitsRenderer) {
    
        var ensureDependenciesAreSet = function () {
            animatedQubitsRenderer = animatedQubitsRenderer || globals.animatedQubitsRenderer;
        };
    
        return function (qstate, config) {
            ensureDependenciesAreSet();
            var numBits = qstate.numBits(),
                renderer;
                
            return {
                display: function (svgElement) {
                    renderer = animatedQubitsRenderer({
                        element: svgElement,
                        numBits: numBits,
                        maxRadius: config.maxRadius
                    });
                    renderer.updateDimensions();
                    renderer.renderBitLabels();
                    renderer.renderStateLabels();
                }
            };
        };
    };

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['animatedQubitsRenderer'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(require('./lib/animatedQubitsRenderer'));
    } else {
        globals.animatedQubits = createModule();
    }


})(this);