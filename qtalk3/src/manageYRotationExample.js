/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits,
        qstate = jsqubits("0");
    
    function manageAnimation() {
        var animation,
            svgElement = jQuery("#yRotationSvg"),
            yRotationButton = jQuery("#yRotationButton"),
            qstateElement = jQuery("#yRotationQState");

        function displayState(newState) {
            var newStateText = "";
            newState.each(function (stateComponent) {
                if (newStateText !== "") {newStateText += " and ";}
                var magnitude = stateComponent.amplitude.magnitude();
                newStateText += (magnitude * magnitude * 100).toFixed() + "% chance of being " + stateComponent.asBitString();
            });
            qstateElement.text(newStateText);
        }


        function onClickYRotation() {
            function yRotation(localQState) {
                return localQState.rotateY(0, Math.PI/4);
            }

            animation.applyOperation(yRotation)
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }

        animation = animatedQubits(qstate, {maxRadius: 30});
        animation.display(svgElement[0]);
        svgElement.height(animation.getNaturalDimensions().height);
        displayState(qstate);
        yRotationButton.click(onClickYRotation);

    }

    module.exports = manageAnimation;
    
}());