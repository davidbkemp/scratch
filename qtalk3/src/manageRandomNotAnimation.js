/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits,
        Q = require("q");
    
    function manageRandomNotAnimation() {
        
        var svgElement = jQuery("#randomNotExampleSvg"),
            qstate = jsqubits("00"),
            animation = animatedQubits(qstate, {maxRadius: 30}),
            currentOperationPromise = Q.when();
        
        function onClickNot(bit) {
            function randomNot(localQState) {
                var complementState = localQState.not(bit).multiply(0.3);
                return localQState.multiply(0.7).add(complementState);
            }
            
            currentOperationPromise.then(
                animation.applyOperation.bind(animation, randomNot))
            .fail(function error(msg) {
                alert(msg);
            });
            
        }
        animation.display(svgElement[0]);
        svgElement.height(animation.getNaturalDimensions().height);
        
        jQuery("#randomNotExampleNot0Button").click(onClickNot.bind(null, 0));
        jQuery("#randomNotExampleNot1Button").click(onClickNot.bind(null, 1));

    }
    
    module.exports = manageRandomNotAnimation;
    
}());