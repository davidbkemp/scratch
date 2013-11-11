({
    paths: {
      "animatedQubitsRenderer": "lib/animatedQubitsRenderer",
      "qubitsGraphics": "lib/qubitsGraphics",
      "d3": "empty:",
      "d3MeasureText": "empty:"
    },
    exclude: ['d3', 'd3MeasureText'],
    name: "animatedQubits",
    out: "animatedQubits.min.js",
    removeCombined: true
})
