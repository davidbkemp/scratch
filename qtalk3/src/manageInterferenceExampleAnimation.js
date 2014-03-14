/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
    
    function manageAnimation() {
        var animation,
            svgElement = jQuery("#interferenceExampleSvg"),
            qstateElement = jQuery("#interferenceQState"),
            tButton = jQuery("#interferenceExampleButton");
            
        function displayState(newState) {
            var newStateText = "";
            newState.each(function (stateComponent) {
                if (newStateText !== "") {newStateText += " and ";}
                var magnitude = stateComponent.amplitude.magnitude();
                newStateText += (magnitude * magnitude * 100).toFixed() + "% chance of being " + stateComponent.asBitString();
            });
            qstateElement.text(newStateText);
        }

        function onClickOperationButton() {

            function operation(localQState) {
                return localQState.hadamard(0);
            }

            animation.applyOperation(operation)
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
            
        }
    
        function reset() {
            var qstate = jsqubits("0").hadamard(0).t(0);
            svgElement.empty();
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
            displayState(qstate);
        }

        reset();

        tButton.click(onClickOperationButton);
    }

    module.exports = manageAnimation;
    
}());