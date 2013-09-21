function start($) {
    function log(message) {
        $('#log').append($('<div>').text(message));
    }

    function asBinary(i, length) {
        i = (typeof i == 'string') ? parseInt(i, 10) : i;
        var paddedString = "00000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    function createSections(svgSelector, config) {
        var svg = d3.select(svgSelector);
        svg.append('g').attr('class', 'qstateBitLabels').attr('transform', 'translate(0,' + config.textHeight + ')');
        svg.append('g').attr('class', 'qstateBody').attr('transform', 'translate(0,' + (1.3 * config.textHeight) + ')');
    }


    function computeStateLabelTransform(basisState, maxRadius, textHeight) {
        return 'translate(0,' + (2 * basisState * maxRadius + maxRadius + (textHeight / 3)) + ')';
    }

    function computeAmplitudeYValue(maxRadius, basisState) {
        return maxRadius * (1 + 2 * basisState);
    }

    function renderStateLabels(svgSelector, numBits, config) {
        var numStates = 1 << numBits;
        var svg = d3.select(svgSelector);
        for (var basisState = 0; basisState < numStates; basisState++) {
            var labelElement = svg.append('g')
                .attr('class', 'qstate')
                .attr('transform', computeStateLabelTransform(basisState, config.maxRadius, config.textHeight));
            var label = asBinary(basisState, numBits);
            for (var bitPos = 0; bitPos < label.length; bitPos++) {
                labelElement.append('text')
                    .attr('class', 'qstateBit')
                    .attr('x', bitPos * config.textWidth)
                    .text(label.charAt(bitPos));
            }
        }
    }

    function renderBitLabels(svgSelector, numBits, config) {
        var svg = d3.select(svgSelector);
        for (var bit = (numBits - 1); bit >= 0; bit--) {
            var bitLabel = svg.append('text').attr('x', (numBits - bit - 1) * config.textWidth);
            bitLabel.append('tspan').text('b').attr('y', 0);
            bitLabel.append('tspan').attr('class', 'qstateBitLabelsSubscript').attr('y', config.textHeight / 8).text(bit);
        }
    }

    function createAmplitudeGraphicTransform(config, numBits, stateWithAmplitude) {
        var x = stateWithAmplitude.x;
        var y = stateWithAmplitude.y;
        var degrees = -180 * stateWithAmplitude.amplitude.phase() / Math.PI;
        var scale = stateWithAmplitude.amplitude.magnitude();
        return 'translate(' + x + ',' + y + ') scale(' + scale + ') rotate(' + degrees + ')';
    }

    function appendArrow(d3Selection, options) {

        var length = options.length;
        var lineClass = options.lineClass;
        var headClass = options.headClass;

        d3Selection
            .append("line")
            .attr('class', lineClass)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', length)
            .attr('y2', 0);

        var headLength = length / 4;
        var x1 = length - headLength;
        var y1 = -headLength / 2;
        var x2 = x1;
        var y2 = y1 + headLength;
        var x3 = length;
        var y3 = 0;

        d3Selection
            .append("polygon")
            .attr('class', headClass)
            .attr('points', '' + x1 + "," + y1 + " " + x2 + "," + y2 + " " + x3 + "," + y3);
    }

    function renderNewAmplitudes(amplitudeGroup, expandedState, config) {
        var newAmplitudes = amplitudeGroup.enter()
            .append('g')
            .attr('class', 'amplitude')
            .attr('transform', function(stateWithAmplitude) {
                return createAmplitudeGraphicTransform(config, expandedState.numBits, stateWithAmplitude);
            });

        newAmplitudes
            .append("circle")
            .attr('class', 'amplitudeCircle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr("r", config.maxRadius);

        appendArrow(newAmplitudes, {length: config.maxRadius, lineClass: 'phaseLine', headClass: 'phaseLineEnd'});
    }

    function transitionExistingAmplitudes(amplitudeGroup, expandedState, config) {
        var transitionEndPromises = [];
        amplitudeGroup.transition()
            .duration(config.duration == null ? 1000 : config.duration)
            .attr('transform', function(stateWithAmplitude) {
                return createAmplitudeGraphicTransform(config, expandedState.numBits, stateWithAmplitude);
            })
            .each(function() {
                transitionEndPromises.push(new $.Deferred());
            })
            .each('end', function () {
                transitionEndPromises.pop().resolve();
            });
        return $.when.apply(null, transitionEndPromises);
    }

    function renderAmplitudes(svgSelector, expandedState, config) {
        var amplitudeGroup = d3.select(svgSelector)
            .selectAll('.amplitude')
            .data(expandedState.amplitudes, function (stateWithAmplitude) {
                return stateWithAmplitude.key;
            });

        var transitionsEndedPromise = transitionExistingAmplitudes(amplitudeGroup, expandedState, config);
        renderNewAmplitudes(amplitudeGroup, expandedState, config);
        amplitudeGroup.exit().remove();
        return transitionsEndedPromise;
    }

    function createPhase1State(amplitudeWithState, subSeq) {
        var clonedState = _.clone(amplitudeWithState);
        var key = amplitudeWithState.key + '-' + subSeq;
        clonedState.key = key;
        if (subSeq > 1) {
            clonedState.amplitude = jsqubits.ZERO;
        }
        return clonedState;
    }

    function createPhase2aState(originalState, phase1State) {
        var phase2aState = _.clone(phase1State);
        phase2aState.amplitude = originalState.amplitude;
        return phase2aState;
    }

    function createPhase2bState(phase1State, newState, statesGroupedByDestinationState) {
        var phase2aState = phase1State.phase2aState;
        var phase2bState = _.clone(phase2aState);
        phase2bState.amplitude = phase2aState.amplitude.multiply(newState.amplitude);
        var basisState = newState.index;
        phase2bState.index = basisState;
        var group = statesGroupedByDestinationState[basisState];
        if (!group) {
            group = [];
            statesGroupedByDestinationState[basisState] = group;
            phase2bState.x += 3 * config.maxRadius;
            phase2bState.y = computeAmplitudeYValue(config.maxRadius, basisState);
        } else {
            var prevState = _.last(group).phase2bState;
            var prevAmplitude = prevState.amplitude;
            phase2bState.x = prevState.x + prevAmplitude.real() * config.maxRadius;
            phase2bState.y = prevState.y - prevAmplitude.imaginary() * config.maxRadius;
        }
        group.push(phase1State);
        return phase2bState;
    }

    function phase1(op, selector, expandedState, config) {
        var clonedStates = [];
        var statesGroupedByOriginalState = [];
        var statesGroupedByDestinationState = {};
        var newExpandedState = {
            amplitudes: clonedStates,
            numBits: expandedState.numBits
        };
        _.forEach(expandedState.amplitudes, function(amplitudeWithState) {
            var qstate = op(jsqubits(asBinary(amplitudeWithState.index, expandedState.numBits)));
            statesGroup = [];
            statesGroupedByOriginalState.push(statesGroup);
            var subSeq = 1;
            qstate.each(function (newState) {
                var phase1State = createPhase1State(amplitudeWithState, subSeq++);
                phase1State.phase2aState = createPhase2aState(amplitudeWithState, phase1State);
                phase1State.phase2bState = createPhase2bState(phase1State, newState, statesGroupedByDestinationState);
                clonedStates.push(phase1State);
                statesGroup.push(phase1State);
            });
        });
        
        return renderAmplitudes(selector, newExpandedState, config)
            .then(function () {
                return {
                    selector: selector,
                    newExpandedState: newExpandedState,
                    statesGroupedByOriginalState: statesGroupedByOriginalState,
                    statesGroupedByDestinationState: statesGroupedByDestinationState,
                    config: config};
            });
    }

    function phase2(context, selector, newExpandedState, statesGroupedByOriginalState, statesGroupedByDestinationState, config) {
        var promise = $.when();
        _.forEach(context.statesGroupedByOriginalState, function(statesGroup) {
            promise = promise.then(phase2a(context, statesGroup))
                .then(phase2b(context, statesGroup));
        });
        return promise.then(function () {return context;});
    }

    function phase2a(context, statesGroup) {
        return function () {
            log('phase 2a');
            _.forEach(statesGroup, function(state) {
                _.assign(state, state.phase2aState);
            });
            return renderAmplitudes(context.selector, context.newExpandedState, _.assign(_.clone(context.config), {duration: 0}));
        }
    }

    function phase2b(context, statesGroup) {
        return function () {
            log('phase 2b');
            _.forEach(statesGroup, function(state) {
                _.assign(state, state.phase2bState);
            });
            return renderAmplitudes(context.selector, context.newExpandedState, context.config);
        }
    }
    
    function phase3(context) {
    	log("phase 3");
    	_.forOwn(context.statesGroupedByDestinationState, function (stateGroup) {
    	    var totalAmplitude = _.reduce(stateGroup, function (accumulator, state) {
    	        return accumulator.add(state.amplitude);
    	    }, jsqubits.ZERO);
    	    if (totalAmplitude.magnitude() > 0.0001) {
    	        stateGroup[0].amplitude = totalAmplitude;
    	    } else {
    	        stateGroup[0].amplitude = stateGroup[0].amplitude.multiply(jsqubits.complex(0.0001));
    	    }
    	    var endOfArrowX = stateGroup[0].x + totalAmplitude.real() * config.maxRadius;
    	    var endOfArrowY = stateGroup[0].y - totalAmplitude.imaginary() * config.maxRadius;
    	    for (var i = 1; i < stateGroup.length; i++) {
    	        var state = stateGroup[i];
    	        state.amplitude = state.amplitude.multiply(jsqubits.complex(0.0001, 0));
    	        state.x = endOfArrowX;
    	        state.y = endOfArrowY;
    	    }
    	});
    	return renderAmplitudes(context.selector, context.newExpandedState, context.config);
    }

    function applyOperator(op, selector, expandedState, config) {
        phase1(op, selector, expandedState, config)
            .then(phase2)
            .then(phase3);
    }


    function visualiseQState(selector, qstate, config) {

        var numBits = qstate.numBits();

        function expandQState() {
            var keyCount = 0;
            var amplitudes = [];

            qstate.each(function(stateWithAmplitude) {
                stateWithAmplitude.key = 'k' + (++keyCount);
                stateWithAmplitude.x = config.maxRadius + (numBits + 1) * config.textWidth;
                stateWithAmplitude.y = computeAmplitudeYValue(config.maxRadius, stateWithAmplitude.index);
                amplitudes.push(stateWithAmplitude);
            });

            return amplitudes;
        }

        var expandedState = {
            amplitudes: expandQState(),
            numBits: numBits
        };

        createSections(selector, config);
        renderBitLabels(selector + ' .qstateBitLabels', numBits, config);
        renderStateLabels(selector + ' .qstateBody', numBits, config);
        renderAmplitudes(selector + ' .qstateBody', expandedState, config);

        return {
            applyOperator: function(op) {
                applyOperator(op, selector + ' .qstateBody', expandedState, config);
            }
        };
        
    }

    var config = {
        textHeight: 12,
        textWidth: 12,
        maxRadius: 70
    };

 //   var state = visualiseQState('#svg', jsqubits('00').hadamard(jsqubits.ALL).t(0), config);
     var state = visualiseQState('#svg', jsqubits('1').t(jsqubits.ALL).hadamard(jsqubits.ALL), config);


    $('#hadamardBtn').click(function () {
        state.applyOperator(function (s) {
            return s.hadamard(jsqubits.ALL);
        });
    });

    log('all done 1');
}
