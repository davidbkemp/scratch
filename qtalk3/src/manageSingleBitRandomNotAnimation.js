/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits,
        Q = require("q");
    
    function manageRandomNotAnimation(svgSelector, qstateSelector, notButtonSelector,
        resetButtonSelector, measureButtonSelector) {

        var qstate, animation,
            svgElement = jQuery(svgSelector),
            qstateElement = jQuery(qstateSelector),
            currentOperationPromise = Q.when();

        function displayState(newState) {
            var newStateText = "";
            newState.each(function (stateComponent) {
                if (newStateText !== "") newStateText += " and ";
                newStateText += (stateComponent.amplitude.multiply(100).format({decimalPlaces: 1})) + "% chance of being " + stateComponent.asBitString();
            });
            qstateElement.text(newStateText);
        }

        function onClickNot() {
            function randomNot(localQState) {
                var complementState = localQState.not(0).multiply(0.3);
                return localQState.multiply(0.7).add(complementState);
            }
            
            currentOperationPromise = currentOperationPromise
                .then(animation.applyOperation.bind(animation, randomNot))
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
            
        }
        
        function onMeasure() {
            currentOperationPromise = currentOperationPromise
                .then(animation.measure.bind(animation, jsqubits.ALL))
                .then(displayState)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
    
        function reset() {
            svgElement.empty();
            qstate = jsqubits("0");
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
            displayState(qstate);
        }
        
        function onReset() {
            currentOperationPromise = currentOperationPromise
                .then(reset)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
        
        reset();
        
        jQuery(notButtonSelector).click(onClickNot);
        jQuery(resetButtonSelector).click(onReset);
        jQuery(measureButtonSelector).click(onMeasure);

    }

    module.exports = manageRandomNotAnimation;
    
}());