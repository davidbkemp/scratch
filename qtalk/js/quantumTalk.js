jQuery(function ($) {
    function asBinary(i, length) {
        var paddedString = "00000000000000000000000000000000" + i.toString(2);
        return paddedString.substr(paddedString.length - length);
    }

    var qStateCalibrationElement = $('#calibration .qstate');
    var textHeight =  qStateCalibrationElement.height();
    var textWidth =  qStateCalibrationElement.width();

    console.log("textHeight: " + textHeight);
    console.log("textWidth: " + textWidth)

    function renderQState(selector, dataset) {

        var width = 500;
        var height = 500;
        var bitCount = dataset.length;
        var diameter = height / bitCount;
        var radius = diameter / 2;

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
            .attr('opacity', function(d) {
                return (d + 1) / 2;
            })
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
    renderQState("#quantum", [ 0.5, 0.5, 0, 0, 0.5, 0, 0.5, 0 ]);
});

