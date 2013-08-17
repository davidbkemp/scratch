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
            result.basisState = (result.basisState == null) ? index : result.basisState;
            result.seq = (result.seq == null) ? index : result.seq;
            return result;
        });
    }

    function addKeysToAmplitudes(data, keys) {
        keys = keys || [];
        return _.map(data, function(item, index) {
            var result = _.clone(item);
            result.key = (keys[item.basisState] == null) ? index : keys[item.basisState];
            return result;
        });
    }

    function transformToAmplitudesWithKeys(data, keys) {
        data = transformToAmplitudes(data);
        return addKeysToAmplitudes(data, keys);
    }

    function computeStateLabelTransform(dataElement, maxRadius, textHeight) {
        return 'translate(0,' + (2 * dataElement.seq * maxRadius + maxRadius + (textHeight / 3)) + ')';
    }

    var textHeight =  42;
    var textWidth =  35;

    function renderStateLabels(svgSelector, dataSet, maxRadius, numBits) {
        var maxDiameter = 2 * maxRadius;

        d3.select(svgSelector).selectAll('.qstate')
            .data(dataSet, function (item) { return item.seq; })
            .enter()
            .append('g')
            .attr('class', 'qstate')
            .attr('transform', function(dataElement) {
                return computeStateLabelTransform(dataElement, maxRadius, textHeight);
            })
            .attr('opacity', computeOpacity)
            .selectAll('.qstateBit')
            .data(function(dataElement) { return asBinary(dataElement.basisState, numBits).split(''); })
            .enter()
            .append('text')
            .attr('class', 'qstateBit')
            .attr('x', function (dataElement, index) {return index * textWidth;})
            .text(function(dataElement) { return dataElement; });
    }

    function createAmplitudeGraphicTransform(maxRadius, numBits, dataElement) {
        var x = maxRadius + (numBits + 1) * textWidth;
        var y = maxRadius * (1 + 2 * dataElement.seq);
        var degrees = 180 * dataElement.phase / Math.PI;
        var scale = dataElement.magnitude;
        return 'translate(' + x + ',' + y + ') scale(' + scale + ') rotate(' + degrees + ')';
    }

    function renderAmplitudes(svgSelector, dataSet, maxRadius, numBits, options) {

        var amplitudeGroup = d3.select(svgSelector).selectAll('.amplitude')
            .data(dataSet, function (item) { return item.key; })
            .enter()
            .append('g')
            .attr('class', 'amplitude')
            .attr('transform', function(dataElement) {
                return createAmplitudeGraphicTransform(maxRadius, numBits, dataElement);
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
                .attr('points', function(dataElement) {
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

    function createSections(svgSelector) {
        var svg = d3.select(svgSelector);
        svg.append('g').attr('class', 'qstateBitLabels').attr('transform', 'translate(0,' + textHeight + ')');
        svg.append('g').attr('class', 'qstateBody').attr('transform', 'translate(0,' + (1.3 * textHeight) + ')');
    }


    function renderBitLabels(svgSelector, numBits) {
        var svg = d3.select(svgSelector);
        for(var bit = (numBits - 1); bit >= 0; bit--) {
            var bitLabel = svg.append('text').attr('x', (numBits - bit - 1) * textWidth);
            bitLabel.append('tspan').text('b').attr('y', 0);
            bitLabel.append('tspan').attr('class', 'qstateBitLabelsSubscript').attr('y', textHeight/8).text(bit);
        }
    }

    function renderQState(svgSelector, dataSet, options) {
        options = options || {};
        dataSet = transformToAmplitudesWithKeys(dataSet, options.keys);
        var svgHeight = options.height != null ? options.height : 330;
        var maxDiameter = svgHeight / dataSet.length;
        var maxRadius = maxDiameter / 2;
        var numBits = Math.round(Math.log(dataSet.length)/Math.LN2);

        $(svgSelector).data('maxRadius', maxRadius);
        $(svgSelector).data('numBits', numBits);

        createSections(svgSelector);
        renderBitLabels(svgSelector + ' .qstateBitLabels', numBits);
        renderStateLabels(svgSelector + ' .qstateBody', dataSet, maxRadius, numBits);
        renderAmplitudes(svgSelector + ' .qstateBody', dataSet, maxRadius, numBits, options);
    }

    function transitionQState(svgSelector, dataSet, options) {
        options = options || {};
        options.duration = options.duration != null ? options.duration : transitionDurations;
        dataSet = transformToAmplitudesWithKeys(dataSet, options.keys);
        var maxRadius = $(svgSelector).data('maxRadius');
        var numBits = $(svgSelector).data('numBits');

        var svg = d3.select(svgSelector + ' .qstateBody');

        svg.selectAll('.qstate')
            .data(dataSet, function (item) { return item.key; })
            .transition()
            .duration(options.duration)
            .attr('opacity', computeOpacity)
            .attr('transform', function(dataElement) {
                return computeStateLabelTransform(dataElement, maxRadius, textHeight);
            })
        svg.selectAll('.qstate')
            .data(dataSet, function (item) { return item.seq; })
            .selectAll('.qstateBit')
            .data(function(dataElement) { return asBinary(dataElement.basisState, numBits).split(''); })
            .text(function(dataElement) { return dataElement; });

        svg.selectAll('.amplitude')
            .data(dataSet, function (item) { return item.key; })
            .transition()
            .duration(options.duration)
            .attr('transform', function(dataElement) {
                return createAmplitudeGraphicTransform(maxRadius, numBits, dataElement);
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
        }
        transitionQState('#bitFlipNotOperator', bitFlippingNotState, { showPhases: true, duration: 0 });
    });
    
    $('#bitFlipNotOperatorBit0').click(function () {
        for(var i=0; i<bitFlippingNotState.length; i++) {
            bitFlippingNotState[i].basisState = bitFlippingNotState[i].basisState ^ 1;
        }
        transitionQState('#bitFlipNotOperator', bitFlippingNotState, { showPhases: true, duration: 0 });
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

    (function () {
        var state = new jsqubits.QState(
          2, [
          jsqubits.complex(0,1).multiply(0.7),
          jsqubits.complex(-1,0),
          jsqubits.complex(1,1).multiply(0.35),
          jsqubits.complex(1,-1).multiply(0.56)
          ]
      ).normalize();

      var keys = ['k0', 'k1', 'k2', 'k3'];

      renderQState('#CNotOperator', state, { showPhases: true, keys: keys });

      $('#CNot10').click(function () {
           keys = determineNewKeyMappingForSingleBitOperator(state, keys, function (state) {return state.cnot(1,0);});
           state = state.not(0);
           transitionQState('#CNotOperator', state, { showPhases: true, keys: keys });
        });
    })();

    renderQState("#hadamard0", [ {magnitude: 1, phase: 0}, 0], { showPhases: true, height: 150 });
    renderQState("#hadamardP", [ {magnitude: Math.sqrt(0.5), phase: 0}, {magnitude: Math.sqrt(0.5), phase: 0}], { showPhases: true, height: 150 });

});
