/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits");
    
    function manageHadamardAnimation(qstate, svgElementSelector, buttonElementSelector, resetButtonElementSelector, qstateElementSelector) {
        var animation,
            svgElement = jQuery(svgElementSelector),
            hadamardButton = jQuery(buttonElementSelector),
            qstateElement = jQuery(qstateElementSelector),
            resetButton = jQuery(resetButtonElementSelector);

        function displayState(newState) {
            var newStateText = "";
            newState.each(function (stateComponent) {
                if (newStateText !== "") {newStateText += " and ";}
                var magnitude = stateComponent.amplitude.magnitude();
                newStateText += (magnitude * magnitude * 100).toFixed() + "% chance of being " + stateComponent.asBitString();
            });
            qstateElement.text(newStateText);
        }


        function onClickHadamard() {
            function hadamard(localQState) {
                return localQState.hadamard(0);
            }

            hadamardButton.attr('disabled', true);
            animation.applyOperation(hadamard)
                .then(displayState)
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
            displayState(qstate);
        }

        reset();

        hadamardButton.click(onClickHadamard);
        resetButton.click(reset);

    }

    module.exports = manageHadamardAnimation;
    
}());