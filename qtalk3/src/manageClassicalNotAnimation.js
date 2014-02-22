/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits,
        Q = require("q");
    
    function manageClassicalNotAnimation() {
        
        var qstate, animation,
            svgElement = jQuery("#notExampleSvg"),
            qstateElement = jQuery("#notExampleQState"),
            currentOperationPromise = Q.when();


        function replaceBitLabels() {
            var bitNumber = 0;
            var bitLabelSubscripts = ["a", "b"];
            jQuery("#notExampleSvg .animatedQubitsBitLabels text").each(function () {
                jQuery(this).text("bit-"+bitLabelSubscripts[bitNumber++]);
            });
        }

        function reset() {
            svgElement.empty();
            qstate = jsqubits("00");
            animation = animatedQubits(qstate, {maxRadius: 30});
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
            displayState(qstate);
            replaceBitLabels();
        }
            
        function displayState(newState) {
            var newStateText = newState.toString().replace(/[|>]/g, "");
            qstateElement.text(newStateText);
        }
        
        function onClickNot(bit) {
            function not(localQState) {
                return localQState.not(bit);
            }
            
            currentOperationPromise = currentOperationPromise.then(
                animation.applyOperation.bind(animation, not))
            .then(displayState)
            .then(null, function error(msg) {
                alert(msg);
            });
        }
        
        function onReset() {
            currentOperationPromise = currentOperationPromise
                .then(reset)
                .then(null, function error(msg) {
                    alert(msg);
                });
        }
        
        reset();

        jQuery("#notExampleNot0Button").click(onClickNot.bind(null, 0));
        jQuery("#notExampleNot1Button").click(onClickNot.bind(null, 1));
        jQuery("#notExampleResetButton").click(onReset);

    }
    
    module.exports = manageClassicalNotAnimation;
    
}());