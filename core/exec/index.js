const process = require("node:process")
const { debug } = require("@miffa/log")
const Package = require("@miffa/package")

const env = process.env

function exec() {
    debug(env.CLI_TARGET_PATH)
    debug(env.CLI_CACHE_PATH)

    const pkg = new Package({
        targetPath: env.CLI_TARGET_PATH,
        cachePath: env.CLI_CACHE_PATH
    })
    console.log(pkg)
}

module.exports = exec