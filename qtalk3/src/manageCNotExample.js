/*global jQuery, module, require */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
        
    function renderDiagram(selector, qstate) {
        var svgElement = jQuery(selector);
        var animation = animatedQubits(qstate, {maxRadius: 30});
        animation.display(svgElement[0]);
        svgElement.height(animation.getNaturalDimensions().height);
    }

    function manageAnimation() {
        renderDiagram("#cnot-0", jsqubits("00"));
        renderDiagram("#cnot-1", jsqubits("00").hadamard(1));
        renderDiagram("#cnot-2", jsqubits("00").hadamard(1).cnot(1,0));
    }


    module.exports = manageAnimation;
    
}());