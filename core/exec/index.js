const process = require("node:process")
const { debug } = require("@miffa/log")
const Package = require("@miffa/package")

const env = process.env

const SETTINGS = {
    init: "@miffa/init"
}

function exec() {

    const targetPath = env.CLI_TARGET_PATH
    const cachePath = env.CLI_CACHE_PATH
    debug(`targetPath:${targetPath}`)
    debug(`cachePath:${cachePath}`)

    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = "latest"

    const pkg = new Package({
        targetPath,
        cachePath,
        packageName,
        packageVersion
    })

    pkg.getIndexFilePath()
}

module.exports = exec