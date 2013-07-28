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
            result[i] = {magnitude: magnitude, phase: phase, basisState: i, seq: i};
        }
        return result;
    }

    function transformToAmplitudes(data) {
        if (data instanceof jsqubits.QState) return transformQStateToAmplitudes(data);
        return _.map(data, function(item, index) {
            var result = (item == null || typeof item === 'number') ? {magnitude: item} : _.clone(item);
            result.magnitude = result.magnitude || 0;
            result.phase = result.phase || 0;
            result.basisState = result.basisState || index;
            result.seq = result.seq || index;
            return result;
        });
    }

    function addKeysToAmplitudes(data, keys) {
        keys = keys || [];
        return _.map(data, function(item, index) {
            var result = _.clone(item);
            result.key = keys[item.basisState] || index;
            return result;
        });
    }

    function transformToAmplitudesWithKeys(data, keys) {
        data = transformToAmplitudes(data);
        return addKeysToAmplitudes(data, keys);
    }

    var textHeight =  42;
    var textWidth =  58;

    function renderStateLabels(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');
        var numBits = Math.round(Math.log(dataSet.length)/Math.LN2);
        var maxDiameter = 2 * maxRadius;

        var stateLabels = d3.select(svgSelector).selectAll('.qstate')
            .data(dataSet, function (item) { return item.seq; });

        stateLabels.enter()
            .append('text')
            .attr('class', 'qstate')
            .attr('x', 0)
            .attr('y', function(d) {
                return d.seq * maxDiameter + maxRadius + (textHeight / 3);
            })
            .attr('opacity', computeOpacity)
            .text(function(d) {
                return asBinary(d.basisState, numBits);
            });

        stateLabels.exit().remove();
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
        dataSet = transformToAmplitudesWithKeys(dataSet, options.keys);
        var svgHeight = options.height != null ? options.height : 400;
        var maxDiameter = svgHeight / dataSet.length;
        var maxRadius = maxDiameter / 2;

        $(svgSelector).data('maxRadius', maxRadius);

        renderStateLabels(svgSelector, dataSet);
        renderAmplitudes(svgSelector, dataSet, options);
    }

    function transitionQState(svgSelector, dataSet, options) {
        options = options || {};
        options.duration = options.duration != null ? options.duration : transitionDurations;
        dataSet = transformToAmplitudesWithKeys(dataSet, options.keys);
        var maxRadius = $(svgSelector).data('maxRadius');

        var svg = d3.select(svgSelector);

        svg.selectAll('.qstate')
            .data(dataSet, function (item) { return item.seq; })
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


    function determineNewKeyMappingForSingleBitOperator(initialState, initialKeyMapping, operation) {
        var newKeyMapping = [];
        var numBits = initialState.numBits();
        for (var i = 0; i < initialKeyMapping.length; i++) {
            var newState = operation(jsqubits(asBinary(i, numBits)));
            // assume for now that each state is mapped to a single new state.
            newState.each(function (stateWithAmplitude) {
                newKeyMapping[stateWithAmplitude.index] = initialKeyMapping[i];
            });
        }
        return newKeyMapping;
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

    var bitFlippingNotState = [
            {magnitude: 0.7, phase: Math.PI / 4, basisState: 0, seq: 0},
            {magnitude: 0.4, phase: -Math.PI / 8, basisState: 1, seq: 1},
            {magnitude: 0.9, phase: -1, basisState: 2, seq: 2},
            {magnitude: 0.6, phase: 3 * Math.PI / 4, basisState: 3, seq: 3}
    ];

    renderQState('#bitFlipNotOperator', bitFlippingNotState, { showPhases: true });

    $('#bitFlipNotOperatorBit1').click(function () {
        for(var i=0; i<bitFlippingNotState.length; i++) {
            bitFlippingNotState[i].basisState = bitFlippingNotState[i].basisState ^ 2;
alert('seq: ' + bitFlippingNotState[i].seq + ', state: ' + bitFlippingNotState[i].basisState);
        }
        renderQState('#bitFlipNotOperator', bitFlippingNotState, { showPhases: true });
    });
    
    $('#bitFlipNotOperatorBit0').click(function () {
        for(var i=0; i<bitFlippingNotState.length; i++) {
            bitFlippingNotState[i].basisState = bitFlippingNotState[i].basisState ^ 1;
        }
        renderQState('#bitFlipNotOperator', bitFlippingNotState, { showPhases: true });
    });
    
    var notOperatorExampleState = new jsqubits.QState(
        2, [
        jsqubits.complex(0,1).multiply(0.7),
        jsqubits.complex(-1,0),
        jsqubits.complex(1,1).multiply(0.35),
        jsqubits.complex(1,-1).multiply(0.56)
        ]
    ).normalize();

    var notOperatorExampleKeys = ['k0', 'k1', 'k2', 'k3'];

    renderQState('#notOperator', notOperatorExampleState, { showPhases: true, keys: notOperatorExampleKeys });

    $('#notOperatorBit0').click(function () {
        notOperatorExampleKeys =
            determineNewKeyMappingForSingleBitOperator(notOperatorExampleState, notOperatorExampleKeys, function (state) {return state.not(0);});
        notOperatorExampleState = notOperatorExampleState.not(0);
        transitionQState('#notOperator', notOperatorExampleState, { showPhases: true, keys: notOperatorExampleKeys });
    });

    $('#notOperatorBit1').click(function () {
        notOperatorExampleKeys =
            determineNewKeyMappingForSingleBitOperator(notOperatorExampleState, notOperatorExampleKeys, function (state) {return state.not(1);});
        notOperatorExampleState = notOperatorExampleState.not(1);
        transitionQState('#notOperator', notOperatorExampleState, { showPhases: true, keys: notOperatorExampleKeys });
    });

    renderQState("#hadamard0", [ {magnitude: 1, phase: 0}, 0], { showPhases: true, height: 150 });
    renderQState("#hadamardP", [ {magnitude: Math.sqrt(0.5), phase: 0}, {magnitude: Math.sqrt(0.5), phase: 0}], { showPhases: true, height: 150 });

});
