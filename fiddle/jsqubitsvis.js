visQubits = function (qstate, config) {

    var $ = jQuery;

    function log(message) {
        $('#log').append($('<div>').text(message));
    }

    var buttons = [];
    var expandedState = null;
    
    function asBinary(i, length) {
        i = (typeof i == 'string') ? parseInt(i, 10) : i;
        var paddedString = "00000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    function createSections(element, numBits, config) {
        var svg = d3.select(element[0]);
        log("creating sections for: " + numBits);
        svg.selectAll('.qstateBitLabels').remove();
        svg.selectAll('.qstateBody').remove();
        svg.attr('height', '' + (config.maxRadius * (1 + (2 << numBits))) + 'px');
        svg.append('g').attr('class', 'qstateBitLabels').attr('transform', 'translate(0,' + config.textHeight + ')');
        svg.append('g').attr('class', 'qstateBody').attr('transform', 'translate(0,' + (1.3 * config.textHeight) + ')');
    }


    function computeStateLabelTransform(basisState, maxRadius, textHeight) {
        return 'translate(0,' + (2 * basisState * maxRadius + maxRadius + (textHeight / 3)) + ')';
    }

    function computeAmplitudeYValue(maxRadius, basisState) {
        return maxRadius * (1 + 2 * basisState);
    }

    function computeInitialAmplitudeXValue(numBits, config) {
        return config.maxRadius + (numBits + 1) * config.textWidth;
    }
    function renderStateLabels(element, numBits, config) {
        var numStates = 1 << numBits;
        var svg = d3.select(element[0]);
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

    function renderBitLabels(element, numBits, config) {
        var svg = d3.select(element[0]);
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

    function renderAmplitudes(element, expandedState, config) {
        var amplitudeGroup = d3.select(element[0])
            .selectAll('.amplitude')
            .data(expandedState.amplitudes, function (stateWithAmplitude) {
                return stateWithAmplitude.key;
            });

        var transitionsEndedPromise = transitionExistingAmplitudes(amplitudeGroup, expandedState, config);
        renderNewAmplitudes(amplitudeGroup, expandedState, config);
        amplitudeGroup.exit().remove();
        return transitionsEndedPromise;
    }
    
    function expandQState(qstate, config) {
        var keyCount = 0;
        var amplitudes = [];
        var initialXOffset = computeInitialAmplitudeXValue(qstate.numBits(), config);

        qstate.each(function(stateWithAmplitude) {
            stateWithAmplitude.key = 'k' + (++keyCount);
            stateWithAmplitude.x = initialXOffset;
            stateWithAmplitude.y = computeAmplitudeYValue(config.maxRadius, stateWithAmplitude.index);
            amplitudes.push(stateWithAmplitude);
        });
        amplitudes.sort(function (stateA, stateB) {
            var indexA = parseInt(stateA.index, 10);
            var indexB = parseInt(stateB.index, 10);
            return indexA - indexB;
        });
        return amplitudes;
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

    function createPhase2bState(phase1State, context, newState) {
        var key = phase1State.key;
        var config = context.config;
        var keysGroupedByDestinationState = context.keysGroupedByDestinationState;
        var phase2aState = context.phase2aStates[key];
        var phase2bState = _.clone(phase2aState);
        phase2bState.amplitude = phase2aState.amplitude.multiply(newState.amplitude);
        var basisState = newState.index;
        phase2bState.index = basisState;
        var keyGroup = keysGroupedByDestinationState[basisState];
        if (!keyGroup) {
            keyGroup = [];
            keysGroupedByDestinationState[basisState] = keyGroup;
            phase2bState.x += 2 * config.maxRadius;
            phase2bState.y = computeAmplitudeYValue(config.maxRadius, basisState);
        } else {
            var prevState = context.phase2bStates[_.last(keyGroup)];
            var prevAmplitude = prevState.amplitude;
            phase2bState.x = prevState.x + prevAmplitude.real() * config.maxRadius;
            phase2bState.y = prevState.y - prevAmplitude.imaginary() * config.maxRadius;
        }
        keyGroup.push(key);
        return phase2bState;
    }

    function phase1(context) {
        log('phase 1');
        context.expandedState.amplitudes = context.phase1States;
        return renderAmplitudes(context.element, context.expandedState, context.config)
            .then(function () { return context; });
    }

    function phase2(context) {
        log('phase 2');
        var promise = $.when();
        _.forEach(context.statesGroupedByOriginalState, function(stateGroup) {
            promise = promise.then(phase2a(context, stateGroup))
                .then(phase2b(context, stateGroup));
        });
        return promise.then(function () {return context;});
    }

    function phase2a(context, stateGroup) {
        return function () {
            log('phase 2a');
            _.forEach(stateGroup, function(state) {
                _.assign(state, context.phase2aStates[state.key]);
            });
            return renderAmplitudes(context.element, context.expandedState, _.assign(_.clone(context.config), {duration: 0}));
        }
    }

    function phase2b(context, stateGroup) {
        return function () {
            log('phase 2b');
            _.forEach(stateGroup, function(state) {
                _.assign(state, context.phase2bStates[state.key]);
            });
            return renderAmplitudes(context.element, context.expandedState, context.config);
        }
    }
    
    function phase3(context) {
    	log("phase 3");
    	context.expandedState.amplitudes = context.phase3States;
    	return renderAmplitudes(context.element, context.expandedState, context.config)
    	    .then(function () {return context;});
    }

    function phase4(context) {
        log("phase 4");
        context.expandedState.amplitudes = context.phase4States;
        return renderAmplitudes(context.element, context.expandedState, context.config)
    	    .then(function () {return context;});
    }
    
    function phase5(context) {
        log("phase 5");
        context.expandedState.amplitudes = context.phase5States;
        context.expandedState.qstate = context.newQState;
        return renderAmplitudes(context.element, context.expandedState, context.config)
    	    .then(function () {return context;});
    }
    
    
    function createPhase1And2States(context, op) {
        log("createPhase1And2States");
        context.expandedState.amplitudes.forEach(function(amplitudeWithState) {
            var qstate = op(jsqubits(asBinary(amplitudeWithState.index, context.expandedState.numBits)));
            statesGroup = [];
            context.statesGroupedByOriginalState.push(statesGroup);
            var subSeq = 1;
            qstate.each(function (newState) {
                var phase1State = createPhase1State(amplitudeWithState, subSeq++);
                var key = phase1State.key;
                var phase2aState = createPhase2aState(amplitudeWithState, phase1State);
                context.phase2aStates[key] = phase2aState;
                context.phase2bStates[key] = createPhase2bState(phase1State, context, newState);
                context.phase1States.push(phase1State);
                statesGroup.push(phase1State);
            });
        });
    }
    
    function createPhase3States(context) {
        log("createPhase3States");
        _.forOwn(context.keysGroupedByDestinationState, function (keyGroup) {
        
    	    var totalAmplitude = _.reduce(keyGroup, function (accumulator, key) {
    	        return accumulator.add(context.phase2bStates[key].amplitude);
    	    }, jsqubits.ZERO);
    	    
    	    var keyGroupPrimaryState = _.clone(context.phase2bStates[keyGroup[0]]);
    	    if (totalAmplitude.magnitude() > 0.0001) {
    	        keyGroupPrimaryState.amplitude = totalAmplitude;
    	    } else {
    	        keyGroupPrimaryState.amplitude = keyGroupPrimaryState.amplitude.multiply(jsqubits.complex(0.0001));
    	    }
    	    context.phase3States.push(keyGroupPrimaryState);
    	    
    	    var endOfArrowX = keyGroupPrimaryState.x + totalAmplitude.real() * config.maxRadius;
    	    var endOfArrowY = keyGroupPrimaryState.y - totalAmplitude.imaginary() * config.maxRadius;
    	    for (var i = 1; i < keyGroup.length; i++) {
    	        var state = _.clone(context.phase2bStates[keyGroup[i]]);
    	        state.amplitude = state.amplitude.multiply(jsqubits.complex(0.0001, 0));
    	        state.x = endOfArrowX;
    	        state.y = endOfArrowY;
    	        context.phase3States.push(state);
    	    }
    	});
    }
    
    function createPhase4States(context) {
        var xOffset = computeInitialAmplitudeXValue(context.expandedState.numBits, context.config);
        context.phase4States = context.phase3States.map(function (state) {
            var newState = _.clone(state);
            newState.x = xOffset;
            return newState;
        });
    }
    
    function createPhase5States(context, op) {
        log("createPhase5States");
        var oldQState = context.expandedState.qstate;
        var newQState = op(oldQState);
        context.newQState = newQState;
        context.phase5States = expandQState(newQState, context.config);
    }
    
    function createPhases(op, element, expandedState, config) {
        log("creating phases");
        var context = {
            element: element,
            expandedState: expandedState,
            phase1States: [],
            phase2aStates: {},
            phase2bStates: {},
            phase3States: [],
            phase4States: [],
            phase5States: [],
            statesGroupedByOriginalState: [],
            keysGroupedByDestinationState: {},
            config: config
        };
        
        createPhase1And2States(context, op);
        createPhase3States(context);
        createPhase4States(context);
        createPhase5States(context, op);

        log("phases created");
        return context;
    }

    function applyOperator(op, element, expandedState, config, options) {
        var context = createPhases(op, element, expandedState, config);
        if (options && options.simple) {
            return phase1(context)
                .then(phase4)
                .then(phase5)
                .then(function() {log("finished")});
        } else {
            return phase1(context)
                .then(phase2)
                .then(phase3)
                .then(phase4)
                .then(phase5)
                .then(function() {log("finished")});
        }
    }
    
    function visualiseQState(element, qstate, config) {
    
        var numBits = qstate.numBits();
        
        expandedState = {
            qstate: qstate,
            amplitudes: expandQState(qstate, config),
            numBits: numBits
        };

        createSections(element, numBits, config);
        renderBitLabels(element.find('.qstateBitLabels'), numBits, config);
        renderStateLabels(element.find('.qstateBody'), numBits, config);
        renderAmplitudes(element.find('.qstateBody'), expandedState, config);
        
    }

    /*
    var config = {
        textHeight: 12,
        textWidth: 12,
        maxRadius: 70
    };

    var state = visualiseQState('#svg', jsqubits('00'), config);
    
    var lastOperatorPromise = $.when();

    function bindToClick(selector, options, op) {
        $(selector).each(function () {
            $(this).click(function () {
                lastOperatorPromise = lastOperatorPromise.then(function () {
                    return state.applyOperator(op, options);
                });
            });
        });
    }

    bindToClick('#hadamardBtn0', {simple: false}, function (s) {
        return s.hadamard(0);
    });
    
    bindToClick('#hadamardBtn1', {simple: false}, function (s) {
        return s.hadamard(1);
    });
    
    bindToClick('#hadamardBtnAll', {simple: false}, function (s) {
        return s.hadamard(jsqubits.ALL);
    });

    bindToClick('#notBtn0', {simple: true}, function (s) {
        return s.not(0);
    });
    
    bindToClick('#notBtn1', {simple: true}, function (s) {
        return s.not(1);
    });
    
    bindToClick('#notBtnAll', {simple: true}, function (s) {
        return s.not(jsqubits.ALL);
    });
    
    bindToClick('#cnotBtn1_0', {simple: true}, function (s) {
        return s.cnot(1,0);
    });
    
    bindToClick('#cnotBtn0_1', {simple: true}, function (s) {
        return s.cnot(0,1);
    });

    
    bindToClick('#tBtnAll', {simple: true}, function (s) {
        return s.t(jsqubits.ALL);
    });

    bindToClick('#tBtn1', {simple: true}, function (s) {
        return s.t(1);
    });

    bindToClick('#tBtn0', {simple: true}, function (s) {
        return s.t(0);
    });
    
    bindToClick('#qftBtn', {simple: false}, function (s) {
        return s.qft(jsqubits.ALL);
    });
    
    */

    log('all done 1');
    
    var targetElement = null;
    
    return {
        display: function (element) {
            targetElement = element;
            visualiseQState(targetElement, qstate, config)
        },
        updateQState: function (newQState) {
            visualiseQState(targetElement, newQState, config)
        },
        applyOperator: function(op, options) {
                applyOperator(op, targetElement.find('.qstateBody'), expandedState, config, options);
        }
    };
};
