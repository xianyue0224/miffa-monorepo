const fs = require("fs-extra")

const files = fs.readdirSync(__dirname)

const obj = {}

files.map(f => `./${f}`).filter(f => f !== "./index.js").map(f => f.replace(".js", "")).forEach(f => {
    obj[f.replace("./", "")] = require(f)
})

module.exports = obj