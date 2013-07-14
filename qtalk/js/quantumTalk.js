
jQuery(function ($) {

    var transitionDurations = 2000;

    function asBinary(i, length) {
        var paddedString = "00000000000000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    function computeOpacity(dataElement) {
        return (dataElement.magnitude + 0.25) / 1.25;
    }

    function transformQStateToAmplitudes(qstate) {
        var result = [];
        var numberOfBasisStates = 1 << qstate.numBits();
        for (var i = 0; i < numberOfBasisStates; i++) {
            var jsqubitsAmplitude = qstate.amplitude(i);
            var magnitude = jsqubitsAmplitude.magnitude();
            var phase = jsqubitsAmplitude.phase();
            result[i] = {magnitude: magnitude, phase: phase, key: 'k'+i, basisState: i};
        }
        return result;
    }

    function transformToAmplitudes(data) {
        if (data instanceof jsqubits.QState) return transformQStateToAmplitudes(data);
        return _.map(data, function(item, index) {
            var result = (item == null || typeof item === 'number') ? {magnitude: item} : _.clone(item);
            result.magnitude = result.magnitude || 0;
            result.phase = result.phase || 0;
            result.key = result.key || 'k' + index;
            result.basisState = result.basisState || index;
            return result;
        });
    }

    var textHeight =  42;
    var textWidth =  58;

    function renderStateLabels(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');
        var maxDiameter = 2 * maxRadius;

        d3.select(svgSelector).selectAll('.qstate')
            .data(dataSet, function (item) { return item.key; })
            .enter()
            .append('text')
            .attr('class', 'qstate')
            .attr('x', 0)
            .attr('y', function(d) {
                return d.basisState * maxDiameter + maxRadius + (textHeight / 3);
            })
            .attr('opacity', computeOpacity)
            .text(function(d) {
                return asBinary(d.basisState, Math.round(Math.log(dataSet.length)/Math.log(2)));
            });
    }

    function amplitudeCircle(maxRadius, dataElement) {
        return {
            cx: maxRadius + 1.3 * textWidth,
            cy: maxRadius * (1 + 2 * dataElement.basisState),
            radius: maxRadius * dataElement.magnitude
        };
    }

    function createTransformString(maxRadius, dataElement) {
        var circleData = amplitudeCircle(maxRadius, dataElement);
        var x = circleData.cx;
        var y = circleData.cy;
        var degrees = 180 * dataElement.phase / Math.PI;
        var scale = dataElement.magnitude;
        return 'translate(' + x + ',' + y + ') scale(' + scale + ') rotate(' + degrees + ')';
    }

    function renderAmplitudes(svgSelector, dataSet, options) {

        var maxRadius = $(svgSelector).data('maxRadius');

        var amplitudeGroup = d3.select(svgSelector).selectAll('.amplitude')
            .data(dataSet, function (item) { return item.key; })
            .enter()
            .append('g')
            .attr('class', 'amplitude')
            .attr('transform', function(d) {
                return createTransformString(maxRadius, d);
            });

        amplitudeGroup
            .append("circle")
            .attr('class', 'amplitudeCircle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr("r",  maxRadius);

        if (options.showPhases) {
            amplitudeGroup
                .append("line")
                .attr('class', 'phaseLine')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', maxRadius)
                .attr('y2', 0);

            amplitudeGroup
                .append("polygon")
                .attr('class', 'phaseLineEnd')
                .attr('points', function(d) {
                    var headLength = maxRadius/4;
                    var x1 = maxRadius - headLength;
                    var y1 = -headLength/2;
                    var x2 = x1;
                    var y2 = y1 + headLength;
                    var x3 = maxRadius;
                    var y3 = 0;
                    return x1 + "," + y1 + " " + x2 + "," + y2 + " " +  x3 + "," + y3
                });
        }
    }

    function renderQState(svgSelector, dataSet, options) {
        options = options || {};
        dataSet = transformToAmplitudes(dataSet);
        var svgHeight = options.height != null ? options.height : 400;
        var bitCount = dataSet.length;
        var maxDiameter = svgHeight / bitCount;
        var maxRadius = maxDiameter / 2;

        $(svgSelector).data('bitCount', bitCount);
        $(svgSelector).data('maxRadius', maxRadius);

        renderStateLabels(svgSelector, dataSet);
        renderAmplitudes(svgSelector, dataSet, options);
    }

    function transitionQState(svgSelector, dataSet, options) {
        options = options || {};
        options.duration = options.duration != null ? options.duration : transitionDurations;
        dataSet = transformToAmplitudes(dataSet);
        var maxRadius = $(svgSelector).data('maxRadius');

        var svg = d3.select(svgSelector);

        svg.selectAll('.qstate')
            .data(dataSet, function (item) { return item.key; })
            .transition()
            .duration(options.duration)
            .attr('opacity', computeOpacity);

        svg.selectAll('.amplitude')
            .data(dataSet, function (item) { return item.key; })
            .transition()
            .duration(options.duration)
            .attr('transform', function(d) {
                return createTransformString(maxRadius, d);
            });

    }

    renderQState("#classical", [ 0, 0, 0, 0, 0, 0, 1, 0 ]);

    renderQState("#quantum", [ 0.75, 0.75, 0, 0, 0.75, 0, 0.75, 0 ]);

    renderQState("#peek", [ 0.75, 0.75, 0, 0, 0.75, 0, 0.75, 0 ]);
    $('#peekButton').click(function () {
        $('#peekingEye').show();
        transitionQState('#peek', [ 0, 0, 0, 0, 0, 0, 1, 0 ]);
    });

    renderQState("#amplitudes", [ 0, 0.3, 0.75, 0, 0.3, 0, 0.4, 0 ]);

    renderQState("#favouringLargerAmplitudes", [ 0, 0.3, 0.75, 0, 0.3, 0, 0.4, 0 ]);
    $('#favouringLargerAmplitudesPeekButton').click(function () {
        $('#favouringLargerAmplitudesPeekingEye').show();
        transitionQState('#favouringLargerAmplitudes', [ 0, 0, 1, 0, 0, 0, 0, 0 ]);
    });

    renderQState("#phases", [
        {magnitude: 0.9, phase: Math.PI/4},
        {magnitude: 0.9, phase: -Math.PI/8},
        0,
        0,
        {magnitude: 0.9, phase: -1},
        0,
        {magnitude: 0.9, phase: 3 * Math.PI/4},
        0 ],
        {
            showPhases: true
        }
    );

    renderQState("#phasesAndMeasurement", [
        {magnitude: 0.4, phase: Math.PI/4},
        {magnitude: 0.75, phase: -Math.PI/8},
        0,
        0,
        {magnitude: 0.4, phase: -1},
        0,
        {magnitude: 0.4, phase: 3 * Math.PI/4},
        0 ],
        {
            showPhases: true
        }
    );

    $('#phasesAndMeasurementPeekButton').click(function () {
        $('#phasesAndMeasurementPeekingEye').show();
        transitionQState('#phasesAndMeasurement', [
            {magnitude: 0, phase: Math.PI / 4},
            {magnitude: 1, phase: -Math.PI / 8},
            0,
            0,
            {magnitude: 0, phase: -1},
            0,
            {magnitude: 0, phase: 3 * Math.PI / 4},
            0
        ],
            {
                showPhases: true
            });
    });

    var notOperatorExampleState = new jsqubits.QState(
        2, [
        jsqubits.complex(0,1).multiply(0.7),
        jsqubits.complex(-1,0),
        jsqubits.complex(Math.sqrt(0.5),Math.sqrt(0.5)).multiply(0.5),
        jsqubits.complex(Math.sqrt(0.5),-Math.sqrt(0.5)).multiply(0.8)
        ]
    ).normalize();

    renderQState('#notOperator', notOperatorExampleState, { showPhases: true });

    $('#notOperatorBit0').click(function () {
        var result = [];
        var numBits = notOperatorExampleState.numBits();
        var numberOfBasisStates = 1 << numBits;
        for (var i = 0; i < numberOfBasisStates; i++) {
            var isolatedState = [];
            isolatedState[i] = notOperatorExampleState.amplitude(i);
            var newState = new jsqubits.QState(numBits, isolatedState).not(0);
            newState.each(function (stateWithAmplitude) {
                var magnitude = stateWithAmplitude.amplitude.magnitude();
                var phase = stateWithAmplitude.amplitude.phase();
                var key = 'k' + i;
                result[stateWithAmplitude.index] = {magnitude: magnitude, phase: phase, key: key};
            });
        }
        transitionQState('#notOperator', result, { showPhases: true });
        notOperatorExampleState = notOperatorExampleState.not(0);
        setTimeout(function () {
            transitionQState('#notOperator', notOperatorExampleState, { showPhases: true, duration: 0 });
        }, transitionDurations + 500);

    });

    $('#notOperatorBit1').click(function () {
        var result = [];
        var numBits = notOperatorExampleState.numBits();
        var numberOfBasisStates = 1 << numBits;
        for (var i = 0; i < numberOfBasisStates; i++) {
            var isolatedState = [];
            isolatedState[i] = notOperatorExampleState.amplitude(i);
            var newState = new jsqubits.QState(numBits, isolatedState).not(1);
            newState.each(function (stateWithAmplitude) {
                var magnitude = stateWithAmplitude.amplitude.magnitude();
                var phase = stateWithAmplitude.amplitude.phase();
                var key = 'k' + i;
                result[stateWithAmplitude.index] = {magnitude: magnitude, phase: phase, key: key};
            });
        }
        transitionQState('#notOperator', result, { showPhases: true });
        notOperatorExampleState = notOperatorExampleState.not(1);
        setTimeout(function () {
            transitionQState('#notOperator', notOperatorExampleState, { showPhases: true, duration: 0 });
        }, transitionDurations + 500);

    });

    renderQState("#hadamard0", [ {magnitude: 1, phase: 0}, 0], { showPhases: true, height: 150 });
    renderQState("#hadamardP", [ {magnitude: Math.sqrt(0.5), phase: 0}, {magnitude: Math.sqrt(0.5), phase: 0}], { showPhases: true, height: 150 });

});

