/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
    
    function manageAnimation() {
        var animation,
            svgElement = jQuery("#tSvg"),
            tButton = jQuery("#tButton");

        function onClickOperationButton() {

            function operation(localQState) {
                return localQState.t(0);
            }

            animation.applyOperation(operation, {skipInterferenceSteps: true})
                .then(null, function error(msg) {
                    alert(msg);
                });
            
        }
    
        function reset() {
            var qstate = jsqubits("0").hadamard(0);
            svgElement.empty();
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
        }

        reset();

        tButton.click(onClickOperationButton);
    }

    module.exports = manageAnimation;
    
}());