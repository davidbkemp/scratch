/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits,
        Q = require("q");
    
    function manageRandomNotAnimation() {
        
        var qstate, animation,
            svgElement = jQuery("#singleBitRandomNotExampleSvg"),
            currentOperationPromise = Q.when();
        
        function onClickNot() {
            function randomNot(localQState) {
                var complementState = localQState.not(0).multiply(0.3);
                return localQState.multiply(0.7).add(complementState);
            }
            
            currentOperationPromise = currentOperationPromise
                .then(animation.applyOperation.bind(animation, randomNot))
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
        }
        
        function onReset() {
            currentOperationPromise = currentOperationPromise
                .then(reset)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
        
        reset();
        
        jQuery("#singleBitRandomNotExampleNotButton").click(onClickNot);
        jQuery("#singleBitRandomNotResetButton").click(onReset);

    }

    module.exports = manageRandomNotAnimation;
    
}());