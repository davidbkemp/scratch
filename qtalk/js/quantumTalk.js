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

    function renderQState(selector, dataset) {

        var width = 500;
        var height = 400;
        var bitCount = dataset.length;
        var diameter = height / bitCount;
        var radius = diameter / 2;

        $(selector).data('bitCount', bitCount);
        $(selector).data('radius', radius);

        var svg = d3.select(selector);

        svg.attr('width', width).attr('height', height);

        var states = svg.selectAll('.qstate')
            .data(dataset)
            .enter()
            .append('text')
            .attr('class', 'qstate');

        states.attr('x', 0)
            .attr('y', function(d, i) {
                return i * diameter + radius + (textHeight / 3);
            })
            .attr('opacity', computeOpacity)
            .text(function(d, i) {
                return asBinary(i, 3);
            });

        var amplitudes = svg.selectAll('.amplitude')
            .data(dataset)
            .enter()
            .append("circle")
            .attr('class', 'amplitude');

        amplitudes.attr('cx', radius + 1.3 * textWidth)
            .attr('cy', function(d, i) {
                return radius + i * diameter;
            })
            .attr("r", function(d) {
                return  d * radius;
            })
            .attr('fill', '#add8e6');


    }

    renderQState("#classical", [ 0, 0, 0, 0, 0, 0, 1, 0 ]);
    renderQState("#quantum", [ 0.75, 0.75, 0, 0, 0.75, 0, 0.75, 0 ]);

    renderQState("#peek", [ 0.75, 0.75, 0, 0, 0.75, 0, 0.75, 0 ]);

    $('#peekButton').click(function () {
        $('#peekingEye').show();

        var radius = $('#peek').data('radius');

        var data = [ 0, 0, 0, 0, 0, 0, 1, 0 ];

        var delay = 2000;

        var svg = d3.select("#peek");

        svg.selectAll('.amplitude')
            .data(data)
            .transition()
            .duration(delay)
            .attr("r", function(d) {
                return  d * radius;
            });

        svg.selectAll('.qstate')
            .data(data)
            .transition()
            .duration(delay)
            .attr('opacity', computeOpacity);
    });


    renderQState("#amplitudes", [ 0, 0.3, 0.75, 0, 0.3, 0, 0.4, 0 ]);

    renderQState("#favouringLargerAmplitudes", [ 0, 0.3, 0.75, 0, 0.3, 0, 0.4, 0 ]);

    $('#favouringLargerAmplitudesPeekButton').click(function () {
        $('#favouringLargerAmplitudesPeekingEye').show();

        var radius = $('#favouringLargerAmplitudes').data('radius');

        var data = [ 0, 0, 1, 0, 0, 0, 0, 0 ];

        var delay = 2000;

        var svg = d3.select("#favouringLargerAmplitudes");

        svg.selectAll('.amplitude')
            .data(data)
            .transition()
            .duration(delay)
            .attr("r", function(d) {
                return  d * radius;
            });

        svg.selectAll('.qstate')
            .data(data)
            .transition()
            .duration(delay)
            .attr('opacity', computeOpacity);
    });
});

