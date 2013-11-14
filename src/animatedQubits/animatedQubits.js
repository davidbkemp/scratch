/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (rendererFactory, calculatorFactory) {
    
        var ensureDependenciesAreSet = function () {
            rendererFactory = rendererFactory || globals.animatedQubitsInternal.rendererFactory;
            calculatorFactory = calculatorFactory || globals.animatedQubitsInternal.calculatorFactory;
        };
    
        return function (qstate, config) {
            ensureDependenciesAreSet();
            var stateComponents,
                numBits = qstate.numBits(),
                renderer,
                calculator = calculatorFactory(config);

            return {
                display: function (svgElement) {
                    renderer = rendererFactory({
                        element: svgElement,
                        numBits: numBits,
                        maxRadius: config.maxRadius
                    });
                    renderer.updateDimensions();
                    renderer.renderBitLabels();
                    renderer.renderStateLabels();
                    stateComponents = calculator.augmentState(qstate);
                    renderer.renderState(stateComponents);
                }
            };
        };
    };

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['animatedQubitsRenderer', 'qubitAnimationCalculator'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(
            require('./lib/animatedQubitsRenderer'),
            require('./lib/qubitAnimationCalculator'));
    } else {
        globals.animatedQubits = createModule();
    }


})(this);