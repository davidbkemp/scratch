/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits");
    
    function manageHadamardAnimation(qstate, svgElementSelector, buttonElementSelector, resetButtonElementSelector) {
        var animation,
            svgElement = jQuery(svgElementSelector),
            hadamardButton = jQuery(buttonElementSelector),
            resetButton = jQuery(resetButtonElementSelector);

        function onClickHadamard() {
            function hadamard(localQState) {
                return localQState.hadamard(0);
            }

            hadamardButton.attr('disabled', true);
            animation.applyOperation(hadamard)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
    
        function reset() {
            hadamardButton.attr('disabled', false);
            svgElement.empty();
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
        }

        reset();

        hadamardButton.click(onClickHadamard);
        resetButton.click(reset);

    }

    module.exports = manageHadamardAnimation;
    
}());