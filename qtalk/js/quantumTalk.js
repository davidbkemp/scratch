
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

    var textHeight =  42;
    var textWidth =  58;

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

    function createTransformString(maxRadius, dataElement, index) {
        var circleData = amplitudeCircle(maxRadius, dataElement, index);
        var x = circleData.cx;
        var y = circleData.cy;
        var degrees = 180 * dataElement.phase / Math.PI;
        var scale = dataElement.magnitude;
        return 'translate(' + x + ',' + y + ') scale(' + scale + ') rotate(' + degrees + ')';
    }

    function renderAmplitudes(svgSelector, dataSet, options) {

        var maxRadius = $(svgSelector).data('maxRadius');

        var amplitudeGroup = d3.select(svgSelector).selectAll('.amplitude')
            .data(dataSet)
            .enter()
            .append('g')
            .attr('class', 'amplitude')
            .attr('transform', function(d, i) {
                return createTransformString(maxRadius, d, i);
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
                .attr('points', function(d, i) {
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

        svg.selectAll('.qstate')
            .data(dataSet)
            .transition()
            .duration(delay)
            .attr('opacity', computeOpacity);

        svg.selectAll('.amplitude')
            .data(dataSet)
            .transition()
            .duration(delay)
            .attr('transform', function(d, i) {
                return createTransformString(maxRadius, d, i);
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

});

