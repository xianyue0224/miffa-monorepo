const { env } = require("node:process")

function setEnv(k, v, prefix = "MIFFA_") {
    env[`${prefix}${k.toUpperCase()}`] = v
}

module.exports = { setEnv }