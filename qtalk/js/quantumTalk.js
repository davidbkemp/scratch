
jQuery(function ($) {
    function asBinary(i, length) {
        var paddedString = "00000000000000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    var computeOpacity = function(d) {
        return (d + 0.25) / 1.25;
    };

    var qStateCalibrationElement = $('#calibration .qstate');
    var textHeight =  qStateCalibrationElement.height();
    var textWidth =  qStateCalibrationElement.width();

    function renderQState(svgSelector, data) {

        var svgWidth = 500;
        var svgHeight = 400;
        var bitCount = data.length;
        var maxDiameter = svgHeight / bitCount;
        var maxRadius = maxDiameter / 2;

        $(svgSelector).data('bitCount', bitCount);
        $(svgSelector).data('maxRadius', maxRadius);

        var svg = d3.select(svgSelector);

        svg.attr('width', svgWidth).attr('height', svgHeight);

        var states = svg.selectAll('.qstate')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'qstate');

        states.attr('x', 0)
            .attr('y', function(d, i) {
                return i * maxDiameter + maxRadius + (textHeight / 3);
            })
            .attr('opacity', computeOpacity)
            .text(function(d, i) {
                return asBinary(i, 3);
            });

        var amplitudes = svg.selectAll('.amplitude')
            .data(data)
            .enter()
            .append("circle")
            .attr('class', 'amplitude');

        amplitudes.attr('cx', maxRadius + 1.3 * textWidth)
            .attr('cy', function(d, i) {
                return maxRadius + i * maxDiameter;
            })
            .attr("r", function(d) {
                return  d * maxRadius;
            })
            .attr('fill', '#add8e6');


    }

    function transitionQState(svgSelector, dataSet) {
        var maxRadius = $(svgSelector).data('maxRadius');

        var delay = 2000;

        var svg = d3.select(svgSelector);

        svg.selectAll('.amplitude')
            .data(dataSet)
            .transition()
            .duration(delay)
            .attr("r", function(d) {
                return  d * maxRadius;
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
    
});

