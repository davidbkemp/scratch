/*global jQuery, require */

(function () {
    "use strict";

    var jsqubits = require("jsqubits").jsqubits;
    var manageHelpSections = require("./src/manageHelpSections.js");
    var manageClassicalNotAnimation = require("./src/manageClassicalNotAnimation.js");
    var manageSingleBitRandomNotAnimation = require("./src/manageSingleBitRandomNotAnimation.js");
    var manageSimpleHadarmardAnimation = require("./src/manageSimpleHadarmardAnimation.js");
    var manageTAnimation = require("./src/manageTAnimation.js");
    var manageInterferenceExampleAnimation = require("./src/manageInterferenceExampleAnimation.js");

    jQuery(function onLoad() {
        manageHelpSections();
        manageClassicalNotAnimation();
        manageSingleBitRandomNotAnimation();
        manageSimpleHadarmardAnimation(jsqubits("0"), "#hadamard0Svg", "#hadamard0Button", "#hadamard0ResetButton");
        manageSimpleHadarmardAnimation(jsqubits("1"), "#hadamard1Svg", "#hadamard1Button", "#hadamard1ResetButton");
        manageTAnimation();
        manageInterferenceExampleAnimation();
    });
    
}());