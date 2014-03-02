/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;

    function manageHadamardAnimation()
    {
        var animation,
            svgElement = jQuery("#interferenceAndMeasurementSvg"),
            hadamardButton = jQuery("#interferenceAndMeasurementHadamardButton"),
            measureButton = jQuery("#interferenceAndMeasurementMeasurementButton");

        function onClickHadamard() {
            function hadamard(localQState) {
                return localQState.hadamard(0);
            }
            animation.applyOperation(hadamard)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }

        function onMeasure() {
            animation.measure(jsqubits.ALL);
        }

        function reset() {
            svgElement.empty();
            animation = animatedQubits(jsqubits("0"), {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
        }

        reset();
        hadamardButton.click(onClickHadamard);
        measureButton.click(onMeasure);
    }

    module.exports = manageHadamardAnimation;
    
}());