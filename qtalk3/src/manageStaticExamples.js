/*global jQuery, module, require, alert */

(function () {
    "use strict";
    
    var animatedQubits = require("animated-qubits"),
        jsqubits = require("jsqubits").jsqubits;
        
    function renderDiagram(selector, qstate) {
        var svgElement = jQuery(selector);
        var animation = animatedQubits(qstate, {maxRadius: 30});
        if (svgElement.length > 1) alert("Too many matches for " + selector);
        if (svgElement.length > 0) {
            animation.display(svgElement[0]);
            svgElement.height(animation.getNaturalDimensions().height);
        }
    }

    function manageAnimation() {
      //  renderDiagram("#doubleHadamardWithPeeking-0", jsqubits("0"));
        //renderDiagram("#doubleHadamardWithPeeking-1", jsqubits("0").hadamard(0));
        renderDiagram("#doubleHadamardWithPeeking-2", jsqubits("1"));
        renderDiagram("#doubleHadamardWithPeeking-3", jsqubits("1").hadamard(0));
        
        renderDiagram("#cnot-0", jsqubits("00"));
        renderDiagram("#cnot-1", jsqubits("00").hadamard(1));
        renderDiagram("#cnot-2", jsqubits("00").hadamard(1).cnot(1,0));
    }


    module.exports = manageAnimation;
    
}());