const { exit } = require("node:process")
const { join } = require("node:path")
const { getUserHomePath } = require("./getUserHomePath")
const fs = require("fs-extra")
const { debug, error } = require("@miffa/log")

const defaultConfig = {
    lowest_node_version: "12.0.0",
    default_cache_dir: ".miffa_cache",
    init_node_modules: []
}

function getConfigFilePath() {
    return join(getUserHomePath(), "miffa.config.json")
}

function getConfig() {
    const configFilePath = getConfigFilePath()

    debug(`配置文件路径：${configFilePath}`)

    if (!fs.pathExistsSync(configFilePath)) {
        try {
            fs.outputJSONSync(configFilePath, defaultConfig)
        } catch (err) {
            error("创建脚手架配置文件失败")
            exit(1)
        }
    }

    const config = require(configFilePath)

    return config
}

module.exports = {
    getConfig,
    getConfigFilePath
}