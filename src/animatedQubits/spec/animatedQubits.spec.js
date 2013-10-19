/*global require:true, describe:true, it:true, expect:true, beforeEach:true */

(function () {
"use strict";

var animatedQubits = require('../animatedQubits');

describe("animatedQubits", function () {

    var animation;

    beforeEach(function () {
        animation = animatedQubits();
    });

    it("should return an object with a display() method", function () {
        expect(typeof animation.display).toBe("function");
    });
});

})();