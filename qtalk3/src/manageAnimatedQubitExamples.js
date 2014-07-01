/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
    
    function manageExample(selector, initialQState) {
        var animation,
            section = jQuery(selector),
            svgElement = section.find(".qstateSvg"),
            qstateElement = section.find(".qstateValue");

        function displayState(qstate) {
            var newStateText = "";
            qstate.each(function (stateComponent) {
                if (newStateText !== "") {newStateText += " and ";}
                var magnitude = stateComponent.amplitude.magnitude();
                newStateText += (magnitude * magnitude * 100).toFixed() + "% chance of being " + stateComponent.asBitString();
            });
            qstateElement.text(newStateText);
        }
        
        function onOperatorClick(button) {

            var operator = button.attr("data-operator"),
                bits = button.attr("data-qubits").split(",").map(parseInt);
                
            var operation = function (localQState) {
                return localQState[operator](bits);
            };
            
            animation.applyOperation(operation)
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
        
        function onMeasureClick(button) {
            var bits = button.attr("data-qubits").split(",").map(parseInt);
            
            animation.measure(bits)
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
    
        function reset() {
            svgElement.empty();
            animation = animatedQubits(initialQState, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
            displayState(initialQState);
        }

        reset();
        
        section.find(".operator").click(function () {
            onOperatorClick(jQuery(this));
        });
        
        section.find(".measure").click(function () {
            onMeasureClick(jQuery(this));
        });

    }
    
    function manageExamples() {
        manageExample("#interferenceWithMeasureExample", jsqubits("0"));
        manageExample("#doubleHadamardWithPeeking-0", jsqubits("0"));
        manageExample("#doubleHadamardWithPeeking-1", jsqubits("0").hadamard(0));
    }

    module.exports = manageExamples;
    
}());