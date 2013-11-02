/* global animatedQubits, jsqubits, document */

(function () {
"use strict";

var animation = animatedQubits(jsqubits("|101>"), {maxRadius: 50});
animation.display(document.getElementById("svg"));

})();

