/*global jQuery, require */

(function () {
    "use strict";
    
    var manageHelpSections = require("./src/manageHelpSections.js");
    //var manageSvgExtensions = require("./src/manageSvgExtensions.js");
    var manageClassicalNotAnimation = require("./src/manageClassicalNotAnimation.js");
    var manageSingleBitRandomNotAnimation = require("./src/manageSingleBitRandomNotAnimation.js");

    jQuery(function onLoad() {
        manageHelpSections();
      //  manageSvgExtensions();
        manageClassicalNotAnimation();
        manageSingleBitRandomNotAnimation();
    });
    
}());