/*global jQuery, module, require */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
    
    function manageMeasurementExampleAnimation() {
        var animation,
            qstate,
            svgElement = jQuery("#measurementSvg"),
            measurementButton = jQuery("#measurementButton"),
            resetButton = jQuery("#measurementResetButton");

        function onClickMeasurement() {
            animation.measure(jsqubits.ALL)
                .then(function (newQState) {
                    qstate = newQState;
                });
        }
    
        function reset() {
            svgElement.empty();
            qstate = new jsqubits.QState(2, [
                jsqubits.complex(1, 1),
                jsqubits.complex(-4, 1),
                jsqubits.complex(-1, -2),
                jsqubits.complex(1, 3)

            ]).normalize();
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
        }

        reset();

        measurementButton.click(onClickMeasurement);
        resetButton.click(reset);

    }

    module.exports = manageMeasurementExampleAnimation;
    
}());