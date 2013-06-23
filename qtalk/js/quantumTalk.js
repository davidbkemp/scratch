
jQuery(function ($) {
    function asBinary(i, length) {
        var paddedString = "00000000000000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    function computeOpacity(d) {
        return (d.magnitude + 0.25) / 1.25;
    }

    function radiusFunction(maxRadius) {
        return function(d) {
            return  d.magnitude * maxRadius;
        };
    }

    function transformToAmplitudes(data) {
        return _.map(data, function(item) {
            if (item.phase) return item;
            return {magnitude: item, phase: 0};
        });
    }

    var qStateCalibrationElement = $('#calibration .qstate');
    var textHeight =  qStateCalibrationElement.height();
    var textWidth =  qStateCalibrationElement.width();

    function renderStateLabels(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');
        var maxDiameter = 2 * maxRadius;

        d3.select(svgSelector).selectAll('.qstate')
            .data(dataSet)
            .enter()
            .append('text')
            .attr('class', 'qstate')
            .attr('x', 0)
            .attr('y', function(d, i) {
                return i * maxDiameter + maxRadius + (textHeight / 3);
            })
            .attr('opacity', computeOpacity)
            .text(function(d, i) {
                return asBinary(i, 3);
            });
    }

    function renderAmplitudeCircles(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');
        var maxDiameter = 2 * maxRadius;

        var amplitudes = d3.select(svgSelector).selectAll('.amplitude')
            .data(dataSet)
            .enter()
            .append("circle")
            .attr('class', 'amplitude')
            .attr('cx', maxRadius + 1.3 * textWidth)
            .attr('cy', function(d, i) {
                return maxRadius + i * maxDiameter;
            })
            .attr("r", radiusFunction(maxRadius))
            .attr('fill', '#add8e6');
    }

    function renderPhases(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');
        var maxDiameter = 2 * maxRadius;
        var phaseLines = d3.select(svgSelector).selectAll('.phaseLine')
            .data(dataSet)
            .enter()
            .append("line")
            .attr('class', 'phaseLine')
            .attr('x1', maxRadius + 1.3 * textWidth)
            .attr('y1', function(d, i) {
                return maxRadius + i * maxDiameter;
            })
            .attr('x2', function(d, i) {
                return maxRadius + 1.3 * textWidth + d.magnitude * maxRadius;
            })
            .attr('y2', function(d, i) {
                return maxRadius + i * maxDiameter;
            })
            .attr('transform', function(d, i) {
                var x = maxRadius + 1.3 * textWidth;
                var y = maxRadius + i * maxDiameter;
                var degrees = 180 * d.phase / Math.PI;
                return 'rotate(' + degrees + ',' + x + ',' + y + ')';
            });
    }

    function renderAmplitudes(svgSelector, dataSet, options) {
        renderAmplitudeCircles(svgSelector, dataSet);
        if (options.showPhases) renderPhases(svgSelector, dataSet);
    }

    function renderQState(svgSelector, dataSet, options) {
        options = options || {};
        dataSet = transformToAmplitudes(dataSet);
        var svgWidth = 500;
        var svgHeight = 400;
        var bitCount = dataSet.length;
        var maxDiameter = svgHeight / bitCount;
        var maxRadius = maxDiameter / 2;

        $(svgSelector).data('bitCount', bitCount);
        $(svgSelector).data('maxRadius', maxRadius);

        d3.select(svgSelector).attr('width', svgWidth).attr('height', svgHeight);

        renderStateLabels(svgSelector, dataSet);
        renderAmplitudes(svgSelector, dataSet, options);
    }

    function transitionQState(svgSelector, dataSet) {
        dataSet = transformToAmplitudes(dataSet);
        var maxRadius = $(svgSelector).data('maxRadius');

        var delay = 2000;

        var svg = d3.select(svgSelector);

        svg.selectAll('.amplitude')
            .data(dataSet)
            .transition()
            .duration(delay)
            .attr("r", radiusFunction(maxRadius));

        svg.selectAll('.qstate')
            .data(dataSet)
            .transition()
            .duration(delay)
            .attr('opacity', computeOpacity);
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

});

