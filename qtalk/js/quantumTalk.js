
jQuery(function ($) {
    function asBinary(i, length) {
        var paddedString = "00000000000000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    function computeOpacity(dataElement) {
        return (dataElement.magnitude + 0.25) / 1.25;
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

    function amplitudeCircle(maxRadius, dataElement, index) {
        return {
            cx: maxRadius + 1.3 * textWidth,
            cy: maxRadius * (1 + 2 * index),
            radius: maxRadius * dataElement.magnitude
        };
    }

    function renderAmplitudeCircles(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');

        d3.select(svgSelector).selectAll('.amplitude')
            .data(dataSet)
            .enter()
            .append("circle")
            .attr('class', 'amplitude')
            .attr('cx', function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cx;
            })
            .attr('cy',  function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cy;
            })
            .attr("r",  function(d, i) {
                return amplitudeCircle(maxRadius, d, i).radius;
            });
    }

    function renderPhases(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');

        var phaseLineGroups = d3.select(svgSelector).selectAll('.phaseLineGroup')
            .data(dataSet)
            .enter()
            .append("g")
            .attr('class', 'phaseLineGroup')
            .attr('transform', function(d, i) {
                var circleData = amplitudeCircle(maxRadius, d, i);
                var x = circleData.cx;
                var y = circleData.cy;
                var degrees = 180 * d.phase / Math.PI;
                return 'rotate(' + degrees + ',' + x + ',' + y + ')';
            });

        phaseLineGroups
            .append("line")
            .attr('class', 'phaseLine')
            .attr('x1', function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cx;
            })
            .attr('y1', function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cy;
            })
            .attr('x2', function(d, i) {
                var circleData = amplitudeCircle(maxRadius, d, i);
                return circleData.cx + circleData.radius;
            })
            .attr('y2', function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cy;
            });

        phaseLineGroups
            .append("circle")
            .attr('class', 'phaseLineEnd')
            .attr('cx', function(d, i) {
                var circleData = amplitudeCircle(maxRadius, d, i);
                return circleData.cx + circleData.radius;
            })
            .attr('cy',  function(d, i) {
                return amplitudeCircle(maxRadius, d, i).cy;
            })
            .attr("r",  function(d, i) {
                return Math.min(2, amplitudeCircle(maxRadius, d, i).radius/6);
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
            .attr("r", function(d, i) {
                return amplitudeCircle(maxRadius, d, i).radius;
            });

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

