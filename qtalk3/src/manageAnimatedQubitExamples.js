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
                skipInterferenceSteps = button.attr("data-skipInterferenceSteps") != null,
                bits = button.attr("data-qubits").split(",").map(function(x) {return parseInt(x);});
                
            var operation = function (localQState) {
                return localQState[operator](bits);
            };
            
            animation.applyOperation(operation, {skipInterferenceSteps: skipInterferenceSteps})
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
        
        function onMeasureClick(button) {
            var bits = button.attr("data-qubits").split(",").map(function(x) {return parseInt(x);});
            
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

        section.find(".reset").click(reset);

    }
    
    function manageExamples() {
        manageExample("#tExample", jsqubits("0").hadamard(0));

        var measurementExampleState = new jsqubits.QState(2, [
            jsqubits.complex(1, 1),
            jsqubits.complex(-4, 1),
            jsqubits.complex(-1, -2),
            jsqubits.complex(1, 3)
        ]).normalize();
        manageExample("#measurementExample", measurementExampleState);

        manageExample("#fullInterferenceExample", jsqubits("0"));
    }

    module.exports = manageExamples;
    
}());