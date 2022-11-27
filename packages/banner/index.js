const gradientString = require('gradient-string')

const banner = gradientString([
    { color: "#01847f", pos: 0 },
    { color: "#f9d3e3", pos: 0.5 },
    { color: "#01847f", pos: 1 }
]
)('Miffa - A very very cool CLI')

module.exports = banner