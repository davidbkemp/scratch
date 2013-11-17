/* global define, module, require */

(function (globals) {
    "use strict";
    
    var createModule = function (Q, rendererFactory, calculatorFactory) {

        var ensureDependenciesAreSet = function () {
            Q = Q || globals.Q;
            rendererFactory = rendererFactory || globals.animatedQubitsInternal.rendererFactory;
            calculatorFactory = calculatorFactory || globals.animatedQubitsInternal.calculatorFactory;
        };
    
        return function (qstate, config) {
            ensureDependenciesAreSet();
            var stateComponents,
                numBits = qstate.numBits(),
                renderer,
                calculator = calculatorFactory(config),
                currentOperationPromise = Q.when();

            var applyOperation = function (operation) {
                var phases = calculator.createPhases(qstate, stateComponents, operation);
                return renderer.renderState(phases.phase1);
            };

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
                },
                applyOperation: function (operation) {
                    currentOperationPromise = currentOperationPromise.then(function () {
                        return applyOperation(operation);
                    });
                    return currentOperationPromise;
                }
            };
        };
    };

    /* Support AMD and CommonJS, with a fallback of putting animatedQubits in the global namespace */
    if (typeof define !== 'undefined' && define.amd) {
        define(['q', 'animatedQubitsRenderer', 'qubitAnimationCalculator'], createModule);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = createModule(
            require('q'),
            require('./lib/animatedQubitsRenderer'),
            require('./lib/qubitAnimationCalculator'));
    } else {
        globals.animatedQubits = createModule();
    }


})(this);