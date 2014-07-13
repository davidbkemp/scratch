/*global jQuery, require */

(function () {
    "use strict";

    var jsqubits = require("jsqubits").jsqubits;
    var manageHelpSections = require("./src/manageHelpSections.js");
    var manageStaticExamples = require("./src/manageStaticExamples.js");
    var manageAnimatedQubitExamples = require("./src/manageAnimatedQubitExamples.js");
    var manageClassicalNotAnimation = require("./src/manageClassicalNotAnimation.js");
    var manageSingleBitRandomNotAnimation = require("./src/manageSingleBitRandomNotAnimation.js");
    var manageSimpleHadarmardAnimation = require("./src/manageSimpleHadarmardAnimation.js");
    var manageYRotationExample = require("./src/manageYRotationExample.js");

    jQuery(function onLoad() {
        manageHelpSections();
        manageAnimatedQubitExamples();
        manageStaticExamples();
        manageClassicalNotAnimation();
        manageSingleBitRandomNotAnimation(
            "#singleBitRandomNotExampleSvg",
            "#singleBitRandomNotExampleQState",
            "#singleBitRandomNotExampleNotButton",
            "#singleBitRandomNotResetButton");
        manageSingleBitRandomNotAnimation(
            "#peekingSvg",
            "#peekingQState",
            "#peekingNotButton",
            "#na",
            "#peekingButton");
        manageSimpleHadarmardAnimation(jsqubits("0"), "#hadamard0Svg", "#hadamard0Button", "#hadamard0ResetButton", "#hadamard0QState");
        manageSimpleHadarmardAnimation(jsqubits("1"), "#hadamard1Svg", "#hadamard1Button", "#hadamard1ResetButton", "#hadamard1QState");
        manageYRotationExample();
    });
    
}());